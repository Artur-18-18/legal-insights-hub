import express from "express";
import auth from "../middleware/auth.js";

const router = express.Router();

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";
const MAX_CHUNK = 450;

const mapLang = (lang) => {
  if (!lang) return "ru";
  const low = String(lang).toLowerCase();
  if (low === "uz") return "uz-UZ";
  if (low === "ru") return "ru-RU";
  if (low === "en") return "en-GB";
  return low;
};

async function translateChunk(text, source, target) {
  if (!text || !text.trim()) return text;
  const params = new URLSearchParams({
    q: text,
    langpair: `${mapLang(source)}|${mapLang(target)}`,
    de: process.env.TRANSLATE_CONTACT_EMAIL || "admin@yurist.uz",
  });
  const res = await fetch(`${MYMEMORY_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Translation service error: ${res.status}`);
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (!translated) throw new Error("Empty translation response");
  return decodeHtmlEntities(translated);
}

function decodeHtmlEntities(text) {
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ");
}

function splitIntoChunks(text, maxLen = MAX_CHUNK) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  const sentences = text.split(/(?<=[.!?…])\s+/);
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > maxLen && buf) {
      chunks.push(buf.trim());
      buf = s;
    } else {
      buf = buf ? buf + " " + s : s;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());

  const out = [];
  for (const c of chunks) {
    if (c.length <= maxLen) {
      out.push(c);
    } else {
      for (let i = 0; i < c.length; i += maxLen) out.push(c.slice(i, i + maxLen));
    }
  }
  return out;
}

async function translatePlain(text, source, target) {
  if (!text || !text.trim()) return text;
  const chunks = splitIntoChunks(text);
  const translated = [];
  for (const chunk of chunks) {
    const t = await translateChunk(chunk, source, target);
    translated.push(t);
  }
  return translated.join(" ");
}

async function translateHtml(html, source, target) {
  if (!html) return html;
  const placeholders = [];
  let idx = 0;
  const protectedHtml = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, (m) => {
      placeholders.push(m);
      return `@@PH_${idx++}@@`;
    })
    .replace(/<!--[\s\S]*?-->/g, (m) => {
      placeholders.push(m);
      return `@@PH_${idx++}@@`;
    });

  const parts = [];
  const regex = /<[^>]+>/g;
  let lastIndex = 0;
  let m;
  while ((m = regex.exec(protectedHtml)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: "text", value: protectedHtml.slice(lastIndex, m.index) });
    }
    parts.push({ type: "tag", value: m[0] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < protectedHtml.length) {
    parts.push({ type: "text", value: protectedHtml.slice(lastIndex) });
  }

  const translated = [];
  for (const part of parts) {
    if (part.type === "tag") {
      translated.push(part.value);
      continue;
    }
    const rawText = part.value;
    if (!rawText.trim()) {
      translated.push(rawText);
      continue;
    }
    const leadingWs = rawText.match(/^\s*/)?.[0] ?? "";
    const trailingWs = rawText.match(/\s*$/)?.[0] ?? "";
    const core = rawText.slice(leadingWs.length, rawText.length - trailingWs.length);
    try {
      const translatedCore = await translatePlain(core, source, target);
      translated.push(`${leadingWs}${translatedCore}${trailingWs}`);
    } catch {
      translated.push(rawText);
    }
  }

  let result = translated.join("");
  result = result.replace(/@@PH_(\d+)@@/g, (_, i) => placeholders[Number(i)] || "");
  return result;
}

router.post("/", auth, async (req, res) => {
  try {
    const { text, source = "ru", target = "uz", format = "text" } = req.body || {};
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Поле text обязательно" });
    }
    if (source === target) return res.json({ translated: text });

    const translated = format === "html"
      ? await translateHtml(text, source, target)
      : await translatePlain(text, source, target);

    res.json({ translated });
  } catch (error) {
    console.error("Translate error:", error);
    res.status(500).json({ error: error.message || "Ошибка перевода" });
  }
});

router.post("/batch", auth, async (req, res) => {
  try {
    const { items, source = "ru", target = "uz" } = req.body || {};
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Поле items должно быть массивом" });
    }
    const results = [];
    for (const item of items) {
      const { text, format = "text", field } = item || {};
      if (typeof text !== "string" || !text.trim()) {
        results.push({ field, translated: text || "" });
        continue;
      }
      try {
        const translated = format === "html"
          ? await translateHtml(text, source, target)
          : await translatePlain(text, source, target);
        results.push({ field, translated });
      } catch (err) {
        results.push({ field, translated: "", error: err.message });
      }
    }
    res.json({ results });
  } catch (error) {
    console.error("Batch translate error:", error);
    res.status(500).json({ error: error.message || "Ошибка перевода" });
  }
});

export default router;
