import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('better-sqlite3').Database} */
let db;

export function getDb() {
  return db;
}

function nowIso() {
  return new Date().toISOString();
}

function rowCategory(row) {
  if (!row) return null;
  const id = String(row.id);
  return {
    _id: id,
    id,
    name: row.name,
    name_uz: row.name_uz,
    slug: row.slug,
    description: row.description,
    description_uz: row.description_uz,
    icon: row.icon,
    created_at: row.created_at,
  };
}

function rowTag(row) {
  if (!row) return null;
  const id = String(row.id);
  return {
    _id: id,
    id,
    name: row.name,
    name_uz: row.name_uz,
    slug: row.slug,
    created_at: row.created_at,
  };
}

function hydratePost(postRow) {
  if (!postRow) return null;
  const category = postRow.category_id
    ? rowCategory(
        db.prepare("SELECT * FROM categories WHERE id = ?").get(postRow.category_id),
      )
    : null;

  const tags = db
    .prepare(
      `SELECT t.* FROM tags t
       INNER JOIN post_tags pt ON pt.tag_id = t.id
       WHERE pt.post_id = ?
       ORDER BY t.name`,
    )
    .all(postRow.id)
    .map(rowTag);

  const images = db
    .prepare(
      "SELECT id, url, alt_text, sort_order FROM post_images WHERE post_id = ? ORDER BY sort_order, id",
    )
    .all(postRow.id)
    .map((img) => ({
      id: String(img.id),
      url: img.url,
      alt_text: img.alt_text,
      sort_order: img.sort_order ?? 0,
    }));

  const videos = db
    .prepare("SELECT id, url, alt_text FROM post_videos WHERE post_id = ? ORDER BY id")
    .all(postRow.id)
    .map((v) => ({
      id: String(v.id),
      url: v.url,
      alt_text: v.alt_text,
    }));

  const id = String(postRow.id);
  return {
    _id: id,
    id,
    title: postRow.title,
    title_uz: postRow.title_uz,
    slug: postRow.slug,
    excerpt: postRow.excerpt,
    excerpt_uz: postRow.excerpt_uz,
    content: postRow.content,
    content_uz: postRow.content_uz,
    featured_image: postRow.featured_image,
    created_at: postRow.created_at,
    updated_at: postRow.updated_at,
    author_name: postRow.author_name,
    published: Boolean(postRow.published),
    legislation_links: JSON.parse(postRow.legislation_links_json || "[]"),
    category,
    tags,
    post_images: images,
    post_videos: videos,
  };
}

export function isUniqueConstraintError(e) {
  return (
    e?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
    e?.code === "SQLITE_CONSTRAINT_PRIMARYKEY" ||
    (typeof e?.message === "string" && e.message.includes("UNIQUE"))
  );
}

export function initDatabase() {
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = process.env.SQLITE_PATH || path.join(dataDir, "yuristblog.sqlite");
  const dbDir = path.dirname(path.resolve(dbPath));
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  if (process.env.NODE_ENV === "production") {
    console.log("SQLite database file:", dbPath);
  }
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'Администратор',
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_uz TEXT,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      description TEXT,
      description_uz TEXT,
      icon TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_uz TEXT,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_uz TEXT,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      excerpt TEXT,
      excerpt_uz TEXT,
      content TEXT NOT NULL,
      content_uz TEXT,
      featured_image TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      author_name TEXT NOT NULL DEFAULT 'Автор',
      published INTEGER NOT NULL DEFAULT 0,
      legislation_links_json TEXT NOT NULL DEFAULT '[]',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS post_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt_text TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS post_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt_text TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
    CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
  `);

  console.log(`SQLite connected: ${dbPath}`);
}

// ——— Stats ———
export function getStats() {
  const published = db.prepare("SELECT COUNT(*) AS c FROM posts WHERE published = 1").get().c;
  const drafts = db.prepare("SELECT COUNT(*) AS c FROM posts WHERE published = 0").get().c;
  const categories = db.prepare("SELECT COUNT(*) AS c FROM categories").get().c;
  const tags = db.prepare("SELECT COUNT(*) AS c FROM tags").get().c;
  return { posts: published, drafts, categories, tags };
}

// ——— Users ———
export function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE").get(email);
}

export function findUserById(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return undefined;
  return db.prepare("SELECT * FROM users WHERE id = ?").get(n);
}

export async function createUser({ email, password, name, role }) {
  const hashed = await bcrypt.hash(password, 10);
  const t = nowIso();
  const info = db
    .prepare(
      "INSERT INTO users (email, password, name, role, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .run(email.toLowerCase(), hashed, name || "Администратор", role || "admin", t);
  return findUserById(info.lastInsertRowid);
}

export async function comparePassword(user, candidate) {
  return bcrypt.compare(candidate, user.password);
}

// ——— Categories ———
export function listCategories() {
  return db.prepare("SELECT * FROM categories ORDER BY name ASC").all().map(rowCategory);
}

export function findCategoryBySlug(slug) {
  return rowCategory(db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug));
}

export function findCategoryById(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return null;
  return rowCategory(db.prepare("SELECT * FROM categories WHERE id = ?").get(n));
}

export function createCategory(body) {
  const t = nowIso();
  const info = db
    .prepare(
      `INSERT INTO categories (name, name_uz, slug, description, description_uz, icon, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      body.name,
      body.name_uz ?? null,
      String(body.slug).toLowerCase(),
      body.description ?? null,
      body.description_uz ?? null,
      body.icon ?? null,
      t,
    );
  return findCategoryById(info.lastInsertRowid);
}

export function updateCategory(id, body) {
  const n = Number(id);
  if (!Number.isFinite(n)) return null;
  const cur = db.prepare("SELECT * FROM categories WHERE id = ?").get(n);
  if (!cur) return null;
  db.prepare(
    `UPDATE categories SET
      name = COALESCE(?, name),
      name_uz = COALESCE(?, name_uz),
      slug = COALESCE(?, slug),
      description = COALESCE(?, description),
      description_uz = COALESCE(?, description_uz),
      icon = COALESCE(?, icon)
     WHERE id = ?`,
  ).run(
    body.name ?? cur.name,
    body.name_uz !== undefined ? body.name_uz : cur.name_uz,
    body.slug != null ? String(body.slug).toLowerCase() : cur.slug,
    body.description !== undefined ? body.description : cur.description,
    body.description_uz !== undefined ? body.description_uz : cur.description_uz,
    body.icon !== undefined ? body.icon : cur.icon,
    n,
  );
  return findCategoryById(n);
}

export function deleteCategory(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return false;
  const r = db.prepare("DELETE FROM categories WHERE id = ?").run(n);
  return r.changes > 0;
}

// ——— Tags ———
export function listTags() {
  return db.prepare("SELECT * FROM tags ORDER BY name ASC").all().map(rowTag);
}

export function findTagById(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return null;
  return rowTag(db.prepare("SELECT * FROM tags WHERE id = ?").get(n));
}

export function createTag(body) {
  const t = nowIso();
  const info = db
    .prepare(
      "INSERT INTO tags (name, name_uz, slug, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(body.name, body.name_uz ?? null, String(body.slug).toLowerCase(), t);
  return findTagById(info.lastInsertRowid);
}

export function updateTag(id, body) {
  const n = Number(id);
  if (!Number.isFinite(n)) return null;
  const cur = db.prepare("SELECT * FROM tags WHERE id = ?").get(n);
  if (!cur) return null;
  db.prepare(
    `UPDATE tags SET
      name = COALESCE(?, name),
      name_uz = COALESCE(?, name_uz),
      slug = COALESCE(?, slug)
     WHERE id = ?`,
  ).run(
    body.name ?? cur.name,
    body.name_uz !== undefined ? body.name_uz : cur.name_uz,
    body.slug != null ? String(body.slug).toLowerCase() : cur.slug,
    n,
  );
  return findTagById(n);
}

export function deleteTag(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return false;
  return db.prepare("DELETE FROM tags WHERE id = ?").run(n).changes > 0;
}

// ——— Posts ———
function replacePostRelations(postId, tags, post_images, post_videos) {
  db.prepare("DELETE FROM post_tags WHERE post_id = ?").run(postId);
  db.prepare("DELETE FROM post_images WHERE post_id = ?").run(postId);
  db.prepare("DELETE FROM post_videos WHERE post_id = ?").run(postId);

  const insTag = db.prepare("INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)");
  for (const tid of tags || []) {
    const n = Number(tid);
    if (Number.isFinite(n)) insTag.run(postId, n);
  }

  const insImg = db.prepare(
    "INSERT INTO post_images (post_id, url, alt_text, sort_order) VALUES (?, ?, ?, ?)",
  );
  (post_images || []).forEach((img, i) => {
    insImg.run(postId, img.url, img.alt_text ?? null, img.sort_order ?? i);
  });

  const insVid = db.prepare(
    "INSERT INTO post_videos (post_id, url, alt_text) VALUES (?, ?, ?)",
  );
  (post_videos || []).forEach((v) => {
    insVid.run(postId, v.url, v.alt_text ?? null);
  });
}

export function findPosts(query) {
  const { published, category, tag, search } = query;
  const clauses = [];
  const params = [];

  if (published !== undefined && published !== "") {
    clauses.push("p.published = ?");
    params.push(published === "true" || published === true ? 1 : 0);
  }
  if (category) {
    const cn = Number(category);
    if (Number.isFinite(cn)) {
      clauses.push("p.category_id = ?");
      params.push(cn);
    } else {
      clauses.push(
        "p.category_id = (SELECT id FROM categories WHERE slug = ? COLLATE NOCASE LIMIT 1)",
      );
      params.push(String(category));
    }
  }
  if (tag) {
    const tn = Number(tag);
    if (Number.isFinite(tn)) {
      clauses.push(
        "EXISTS (SELECT 1 FROM post_tags pt WHERE pt.post_id = p.id AND pt.tag_id = ?)",
      );
      params.push(tn);
    } else {
      clauses.push(
        `EXISTS (SELECT 1 FROM post_tags pt
          INNER JOIN tags tg ON tg.id = pt.tag_id
          WHERE pt.post_id = p.id AND tg.slug = ? COLLATE NOCASE)`,
      );
      params.push(String(tag));
    }
  }
  if (search && String(search).trim()) {
    const s = String(search).trim().toLowerCase();
    clauses.push(`(
      instr(lower(coalesce(p.title,'')), ?) > 0 OR
      instr(lower(coalesce(p.title_uz,'')), ?) > 0 OR
      instr(lower(coalesce(p.content,'')), ?) > 0 OR
      instr(lower(coalesce(p.content_uz,'')), ?) > 0 OR
      instr(lower(coalesce(p.excerpt,'')), ?) > 0 OR
      instr(lower(coalesce(p.excerpt_uz,'')), ?) > 0
    )`);
    params.push(s, s, s, s, s, s);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT p.* FROM posts p ${where} ORDER BY p.created_at DESC`)
    .all(...params);
  return rows.map((r) => hydratePost(r));
}

export function findPostBySlug(slug) {
  const row = db.prepare("SELECT * FROM posts WHERE slug = ? COLLATE NOCASE").get(slug);
  return hydratePost(row);
}

/** Resolve numeric id or slug to internal row id (for admin edit/update/delete). */
function resolvePostId(param) {
  if (param == null) return null;
  const s = String(param).trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    const byId = db.prepare("SELECT id FROM posts WHERE id = ?").get(n);
    if (byId) return byId.id;
  }
  const bySlug = db.prepare("SELECT id FROM posts WHERE slug = ? COLLATE NOCASE").get(s);
  return bySlug ? bySlug.id : null;
}

export function findPostById(id) {
  const resolved = resolvePostId(id);
  if (resolved == null) return null;
  const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(resolved);
  return hydratePost(row);
}

export function createPost(body) {
  const t = nowIso();
  const legislation = JSON.stringify(body.legislation_links || []);
  const catId =
    body.category == null || body.category === ""
      ? null
      : Number(body.category);
  const category_id = Number.isFinite(catId) ? catId : null;

  const info = db
    .prepare(
      `INSERT INTO posts (
        title, title_uz, slug, excerpt, excerpt_uz, content, content_uz,
        featured_image, created_at, updated_at, author_name, published,
        legislation_links_json, category_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      body.title,
      body.title_uz ?? null,
      String(body.slug).toLowerCase(),
      body.excerpt ?? null,
      body.excerpt_uz ?? null,
      body.content,
      body.content_uz ?? null,
      body.featured_image ?? null,
      t,
      t,
      body.author_name ?? "Автор",
      body.published ? 1 : 0,
      legislation,
      category_id,
    );

  const postId = info.lastInsertRowid;
  replacePostRelations(postId, body.tags || [], body.post_images || [], body.post_videos || []);
  return findPostById(postId);
}

export function updatePost(id, body) {
  const n = resolvePostId(id);
  if (n == null) return null;
  const cur = db.prepare("SELECT * FROM posts WHERE id = ?").get(n);
  if (!cur) return null;

  const t = nowIso();
  const legislation = JSON.stringify(
    body.legislation_links !== undefined
      ? body.legislation_links
      : JSON.parse(cur.legislation_links_json || "[]"),
  );
  let category_id = cur.category_id;
  if (body.category !== undefined) {
    if (body.category == null || body.category === "") category_id = null;
    else {
      const cn = Number(body.category);
      category_id = Number.isFinite(cn) ? cn : null;
    }
  }

  db.prepare(
    `UPDATE posts SET
      title = ?,
      title_uz = ?,
      slug = ?,
      excerpt = ?,
      excerpt_uz = ?,
      content = ?,
      content_uz = ?,
      featured_image = ?,
      updated_at = ?,
      author_name = ?,
      published = ?,
      legislation_links_json = ?,
      category_id = ?
     WHERE id = ?`,
  ).run(
    body.title !== undefined ? body.title : cur.title,
    body.title_uz !== undefined ? body.title_uz : cur.title_uz,
    body.slug !== undefined ? String(body.slug).toLowerCase() : cur.slug,
    body.excerpt !== undefined ? body.excerpt : cur.excerpt,
    body.excerpt_uz !== undefined ? body.excerpt_uz : cur.excerpt_uz,
    body.content !== undefined ? body.content : cur.content,
    body.content_uz !== undefined ? body.content_uz : cur.content_uz,
    body.featured_image !== undefined ? body.featured_image : cur.featured_image,
    t,
    body.author_name !== undefined ? body.author_name : cur.author_name,
    body.published !== undefined ? (body.published ? 1 : 0) : cur.published,
    legislation,
    category_id,
    n,
  );

  const currentTagIds = db
    .prepare("SELECT tag_id FROM post_tags WHERE post_id = ?")
    .all(n)
    .map((x) => x.tag_id);
  const currentImages = db
    .prepare("SELECT url, alt_text, sort_order FROM post_images WHERE post_id = ? ORDER BY sort_order, id")
    .all(n);
  const currentVideos = db.prepare("SELECT url, alt_text FROM post_videos WHERE post_id = ? ORDER BY id").all(n);

  const tags = body.tags !== undefined ? body.tags : currentTagIds;
  const images = body.post_images !== undefined ? body.post_images : currentImages;
  const videos = body.post_videos !== undefined ? body.post_videos : currentVideos;

  replacePostRelations(n, tags, images, videos);
  return findPostById(n);
}

export function deletePost(id) {
  const n = resolvePostId(id);
  if (n == null) return false;
  return db.prepare("DELETE FROM posts WHERE id = ?").run(n).changes > 0;
}

const defaultCategories = [
  { name: "Корпоративное право", name_uz: "Korporativ huquq", slug: "corporate-law", description: "Правовое регулирование деятельности юридических лиц", description_uz: "Yuridik shaxslar faoliyatini huquqiy tartibga solish", icon: "Building2" },
  { name: "Корпоративное управление", name_uz: "Korporativ boshqaruv", slug: "corporate-governance", description: "Структура и процессы управления компаниями", description_uz: "Kompaniyalarni boshqarish tuzilmalari va jarayonlari", icon: "Users" },
  { name: "Конкурентное право", name_uz: "Raqobat huquqi", slug: "competition-law", description: "Антимонопольное регулирование и защита конкуренции", description_uz: "Antimonopiya tartibga solish va raqobatni himoya qilish", icon: "Scale" },
  { name: "Налоги", name_uz: "Soliqlar", slug: "taxes", description: "Налоговое законодательство и практика", description_uz: "Soliq qonunchiligi va amaliyoti", icon: "Calculator" },
  { name: "Строительство", name_uz: "Qurilish", slug: "construction", description: "Правовое регулирование строительной деятельности", description_uz: "Qurilish faoliyatini huquqiy tartibga solish", icon: "HardHat" },
];

const defaultTags = [
  { name: "ГК РУз", name_uz: "FU O'zR", slug: "gk-ruz" },
  { name: "НК РУз", name_uz: "SK O'zR", slug: "nk-ruz" },
  { name: "Антимонополия", name_uz: "Antimonopoliya", slug: "antimonopoliya" },
  { name: "ООО", name_uz: "MChJ", slug: "ooo" },
  { name: "АО", name_uz: "AJ", slug: "ao" },
];

export async function seedDatabase() {
  const t = nowIso();
  const insCat = db.prepare(
    `INSERT OR IGNORE INTO categories (name, name_uz, slug, description, description_uz, icon, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const c of defaultCategories) {
    insCat.run(c.name, c.name_uz, c.slug, c.description, c.description_uz, c.icon, t);
  }
  const updCat = db.prepare("UPDATE categories SET name_uz = ?, description_uz = ? WHERE slug = ?");
  for (const c of defaultCategories) {
    updCat.run(c.name_uz, c.description_uz, c.slug);
  }

  const insTag = db.prepare(
    "INSERT OR IGNORE INTO tags (name, name_uz, slug, created_at) VALUES (?, ?, ?, ?)",
  );
  for (const tg of defaultTags) {
    insTag.run(tg.name, tg.name_uz, tg.slug, t);
  }
  const updTag = db.prepare("UPDATE tags SET name_uz = ? WHERE slug = ?");
  for (const tg of defaultTags) {
    updTag.run(tg.name_uz, tg.slug);
  }

  const postCount = db.prepare("SELECT COUNT(*) AS c FROM posts").get().c;
  if (postCount === 0) {
    const catId = (slug) =>
      db.prepare("SELECT id FROM categories WHERE slug = ?").get(slug)?.id;
    const tagId = (slug) => db.prepare("SELECT id FROM tags WHERE slug = ?").get(slug)?.id;

    const samples = [
      {
        title: "Основы корпоративного права Узбекистана",
        title_uz: "O'zbekiston korporativ huquqi asoslari",
        slug: "osnovy-korporativnogo-prava",
        excerpt: "Обзор ключевых норм корпоративного законодательства Республики Узбекистан",
        excerpt_uz: "O'zbekiston Respublikasi korporativ qonunchiligining asosiy normalariga sharh",
        content: "<p>Корпоративное право Узбекистана регулирует создание, деятельность и ликвидацию юридических лиц.</p><h2>Основные источники</h2><p>Гражданский кодекс Республики Узбекистан является основным источником корпоративного права.</p>",
        content_uz: "<p>O'zbekistonning korporativ huquqi yuridik shaxslarning tashkil etilishi, faoliyati va tugatilishini tartibga soladi.</p><h2>Asosiy manbalar</h2><p>O'zbekiston Respublikasi Fuqarolik kodeksi korporativ huquqning asosiy manbai hisoblanadi.</p>",
        author_name: "Автор",
        published: true,
        category: catId("corporate-law"),
        tags: [tagId("gk-ruz"), tagId("ooo")].filter(Boolean),
        legislation_links: [{ title: "Гражданский кодекс РУз", url: "https://lex.uz/docs/111181" }],
        post_images: [],
        post_videos: [],
      },
      {
        title: "Налоговые льготы для IT-компаний",
        title_uz: "IT-kompaniyalar uchun soliq imtiyozlari",
        slug: "nalogovye-lgoty-it",
        excerpt: "Анализ налоговых преференций для компаний в сфере информационных технологий",
        excerpt_uz: "Axborot texnologiyalari sohasidagi kompaniyalar uchun soliq imtiyozlari tahlili",
        content: "<p>IT-компании в Узбекистане могут воспользоваться рядом налоговых льгот.</p><h2>Основные льготы</h2><p>Резиденты IT Park освобождаются от уплаты налога на прибыль, НДС, налога на имущество и земельного налога.</p>",
        content_uz: "<p>O'zbekistondagi IT-kompaniyalar bir qator soliq imtiyozlaridan foydalanishlari mumkin.</p><h2>Asosiy imtiyozlar</h2><p>IT Park rezidentlari foyda solig'i, QQS, mulk solig'i va yer solig'idan ozod qilinadi.</p>",
        author_name: "Автор",
        published: true,
        category: catId("taxes"),
        tags: [tagId("nk-ruz")].filter(Boolean),
        legislation_links: [{ title: "Налоговый кодекс РУз", url: "https://lex.uz/docs/4674902" }],
        post_images: [],
        post_videos: [],
      },
      {
        title: "Антимонопольное регулирование: новые правила",
        title_uz: "Antimonopoliya tartibga solish: yangi qoidalar",
        slug: "antimonopolnoe-regulirovanie",
        excerpt: "Обзор последних изменений в антимонопольном законодательстве",
        excerpt_uz: "Antimonopoliya qonunchiligiga kiritilgan so'nggi o'zgarishlarga sharh",
        content: "<p>Антимонопольное законодательство Узбекистана претерпело значительные изменения.</p><h2>Ключевые изменения</h2><p>Новые правила ужесточают ответственность за злоупотребление доминирующим положением.</p>",
        content_uz: "<p>O'zbekiston antimonopoliya qonunchiligi jiddiy o'zgarishlarga uchradi.</p><h2>Asosiy o'zgarishlar</h2><p>Yangi qoidalar bozordagi ustun mavqeni suiiste'mol qilish uchun javobgarlikni kuchaytiradi.</p>",
        author_name: "Автор",
        published: true,
        category: catId("competition-law"),
        tags: [tagId("antimonopoliya")].filter(Boolean),
        legislation_links: [{ title: "Закон о конкуренции", url: "https://lex.uz/docs/4679962" }],
        post_images: [],
        post_videos: [],
      },
    ];
    for (const p of samples) {
      createPost({
        ...p,
        category: p.category,
        featured_image: null,
      });
    }
    console.log("Posts seeded");
  } else {
    const uzBySlug = {
      "osnovy-korporativnogo-prava": {
        title_uz: "O'zbekiston korporativ huquqi asoslari",
        excerpt_uz: "O'zbekiston Respublikasi korporativ qonunchiligining asosiy normalariga sharh",
        content_uz:
          "<p>O'zbekistonning korporativ huquqi yuridik shaxslarning tashkil etilishi, faoliyati va tugatilishini tartibga soladi.</p><h2>Asosiy manbalar</h2><p>O'zbekiston Respublikasi Fuqarolik kodeksi korporativ huquqning asosiy manbai hisoblanadi.</p>",
      },
      "nalogovye-lgoty-it": {
        title_uz: "IT-kompaniyalar uchun soliq imtiyozlari",
        excerpt_uz: "Axborot texnologiyalari sohasidagi kompaniyalar uchun soliq imtiyozlari tahlili",
        content_uz:
          "<p>O'zbekistondagi IT-kompaniyalar bir qator soliq imtiyozlaridan foydalanishlari mumkin.</p><h2>Asosiy imtiyozlar</h2><p>IT Park rezidentlari foyda solig'i, QQS, mulk solig'i va yer solig'idan ozod qilinadi.</p>",
      },
      "antimonopolnoe-regulirovanie": {
        title_uz: "Antimonopoliya tartibga solish: yangi qoidalar",
        excerpt_uz: "Antimonopoliya qonunchiligiga kiritilgan so'nggi o'zgarishlarga sharh",
        content_uz:
          "<p>O'zbekiston antimonopoliya qonunchiligi jiddiy o'zgarishlarga uchradi.</p><h2>Asosiy o'zgarishlar</h2><p>Yangi qoidalar bozordagi ustun mavqeni suiiste'mol qilish uchun javobgarlikni kuchaytiradi.</p>",
      },
    };
    for (const [slug, uz] of Object.entries(uzBySlug)) {
      const row = db.prepare("SELECT id FROM posts WHERE slug = ?").get(slug);
      if (!row) continue;
      const cur = db.prepare("SELECT title_uz, excerpt_uz, content_uz FROM posts WHERE id = ?").get(row.id);
      if (cur && (!cur.title_uz || !cur.excerpt_uz || !cur.content_uz)) {
        db.prepare(
          "UPDATE posts SET title_uz = ?, excerpt_uz = ?, content_uz = ?, updated_at = ? WHERE id = ?",
        ).run(uz.title_uz, uz.excerpt_uz, uz.content_uz, nowIso(), row.id);
      }
    }
  }

  const admin = findUserByEmail("admin@yurist.uz");
  if (!admin) {
    await createUser({
      email: "admin@yurist.uz",
      password: "admin123",
      name: "Администратор",
      role: "admin",
    });
    console.log("Default admin user created: admin@yurist.uz / admin123");
  }
}
