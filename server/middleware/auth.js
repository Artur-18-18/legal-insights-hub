import jwt from "jsonwebtoken";

function getJwtSecret() {
  return process.env.JWT_SECRET || "secret-key-change-in-production";
}

function parseCookies(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== "string") return {};
  const out = {};
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    let val = part.slice(idx + 1).trim();
    try {
      val = decodeURIComponent(val);
    } catch {
      /* ignore */
    }
    out[key] = val;
  }
  return out;
}

/** Токен: Authorization → X-Access-Token → cookie admin_token (если прокси режет заголовки). */
function extractAccessToken(req) {
  const auth = req.headers.authorization;
  if (typeof auth === "string") {
    const m = auth.match(/^Bearer\s+(\S+)/i);
    if (m?.[1]) return m[1];
  }
  const x = req.headers["x-access-token"];
  if (typeof x === "string" && x.trim()) return x.trim();
  const fromCookie = parseCookies(req.headers.cookie).admin_token;
  if (typeof fromCookie === "string" && fromCookie.trim()) return fromCookie.trim();
  return null;
}

const authMiddleware = (req, res, next) => {
  const token = extractAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: "Нет токена авторизации" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Неверный или просроченный токен" });
  }
};

export default authMiddleware;
