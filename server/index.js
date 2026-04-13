import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import categoryRoutes from "./routes/categories.js";
import tagRoutes from "./routes/tags.js";

const app = express();

// Railway sets PORT env variable; fallback to SERVER_PORT or 3001
const PORT = process.env.PORT || process.env.SERVER_PORT || 3001;

// Determine if running in production (Vite dist/ exists)
const isProduction = process.env.NODE_ENV === "production";

// Middleware
if (isProduction) {
  // In production: serve Vite build output and allow same-origin API calls
  app.use(cors());
  app.use(express.static(path.join(__dirname, "..", "dist"), { maxAge: "1d" }));
} else {
  // In development: allow client URL
  app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:8080" }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);

// Stats endpoint
app.get("/api/stats", async (req, res) => {
  try {
    const Post = (await import("./models/Post.js")).default;
    const Category = (await import("./models/Category.js")).default;
    const Tag = (await import("./models/Tag.js")).default;
    const publishedCount = await Post.countDocuments({ published: true });
    const draftCount = await Post.countDocuments({ published: false });
    const categoryCount = await Category.countDocuments();
    const tagCount = await Tag.countDocuments();
    res.json({ posts: publishedCount, drafts: draftCount, categories: categoryCount, tags: tagCount });
  } catch (error) {
    res.json({ posts: 0, drafts: 0, categories: 0, tags: 0 });
  }
});

// Seed initial data
const seedData = async () => {
  const Category = (await import("./models/Category.js")).default;
  const Tag = (await import("./models/Tag.js")).default;
  const Post = (await import("./models/Post.js")).default;
  const User = (await import("./models/User.js")).default;

  // Default categories with translations
  const defaultCategories = [
    { name: "Корпоративное право", name_uz: "Korporativ huquq", slug: "corporate-law", description: "Правовое регулирование деятельности юридических лиц", description_uz: "Yuridik shaxslar faoliyatini huquqiy tartibga solish", icon: "Building2" },
    { name: "Корпоративное управление", name_uz: "Korporativ boshqaruv", slug: "corporate-governance", description: "Структура и процессы управления компаниями", description_uz: "Kompaniyalarni boshqarish tuzilmalari va jarayonlari", icon: "Users" },
    { name: "Конкурентное право", name_uz: "Raqobat huquqi", slug: "competition-law", description: "Антимонопольное регулирование и защита конкуренции", description_uz: "Antimonopiya tartibga solish va raqobatni himoya qilish", icon: "Scale" },
    { name: "Налоги", name_uz: "Soliqlar", slug: "taxes", description: "Налоговое законодательство и практика", description_uz: "Soliq qonunchiligi va amaliyoti", icon: "Calculator" },
    { name: "Строительство", name_uz: "Qurilish", slug: "construction", description: "Правовое регулирование строительной деятельности", description_uz: "Qurilish faoliyatini huquqiy tartibga solish", icon: "HardHat" },
  ];

  const catCount = await Category.countDocuments();
  if (catCount === 0) {
    await Category.insertMany(defaultCategories);
    console.log("✅ Categories seeded");
  } else {
    // Migration: update existing categories with _uz fields
    let migrated = 0;
    for (const def of defaultCategories) {
      const result = await Category.updateOne(
        { slug: def.slug, $or: [{ name_uz: null }, { name_uz: { $exists: false } }] },
        { $set: { name_uz: def.name_uz, description_uz: def.description_uz } }
      );
      migrated += result.modifiedCount;
    }
    if (migrated > 0) {
      console.log(`✅ Categories migrated: ${migrated} categories updated with _uz fields`);
    } else {
      console.log("✅ Categories already migrated");
    }
  }

  // Default tags with translations
  const defaultTags = [
    { name: "ГК РУз", name_uz: "FU O'zR", slug: "gk-ruz" },
    { name: "НК РУз", name_uz: "SK O'zR", slug: "nk-ruz" },
    { name: "Антимонополия", name_uz: "Antimonopoliya", slug: "antimonopoliya" },
    { name: "ООО", name_uz: "MChJ", slug: "ooo" },
    { name: "АО", name_uz: "AJ", slug: "ao" },
  ];

  const tagCount = await Tag.countDocuments();
  if (tagCount === 0) {
    await Tag.insertMany(defaultTags);
    console.log("✅ Tags seeded");
  } else {
    // Migration: update existing tags with name_uz field
    let migrated = 0;
    for (const def of defaultTags) {
      const result = await Tag.updateOne(
        { slug: def.slug, $or: [{ name_uz: null }, { name_uz: { $exists: false } }] },
        { $set: { name_uz: def.name_uz } }
      );
      migrated += result.modifiedCount;
    }
    if (migrated > 0) {
      console.log(`✅ Tags migrated: ${migrated} tags updated with name_uz field`);
    } else {
      console.log("✅ Tags already migrated");
    }
  }

  const postCount = await Post.countDocuments();
  if (postCount === 0) {
    const cats = await Category.find();
    const tagsArr = await Tag.find();
    const catMap = {};
    cats.forEach(c => { catMap[c.slug] = c._id; });
    const tagMap = {};
    tagsArr.forEach(t => { tagMap[t.slug] = t._id; });

    await Post.insertMany([
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
        category: catMap["corporate-law"],
        tags: [tagMap["gk-ruz"], tagMap["ooo"]],
        legislation_links: [{ title: "Гражданский кодекс РУз", url: "https://lex.uz/docs/111181" }],
        post_images: [],
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
        category: catMap["taxes"],
        tags: [tagMap["nk-ruz"]],
        legislation_links: [{ title: "Налоговый кодекс РУз", url: "https://lex.uz/docs/4674902" }],
        post_images: [],
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
        category: catMap["competition-law"],
        tags: [tagMap["antimonopoliya"]],
        legislation_links: [{ title: "Закон о конкуренции", url: "https://lex.uz/docs/4679962" }],
        post_images: [],
      },
    ]);
    console.log("Posts seeded");
  } else {
    // Migration: add _uz fields to existing posts if they don't have them
    const postsWithoutUz = await Post.find({
      $or: [
        { title_uz: null },
        { excerpt_uz: null },
        { content_uz: null },
        { title_uz: { $exists: false } },
        { excerpt_uz: { $exists: false } },
        { content_uz: { $exists: false } },
      ]
    });

    if (postsWithoutUz.length > 0) {
      const defaultPostsUz = [
        {
          slug: "osnovy-korporativnogo-prava",
          title_uz: "O'zbekiston korporativ huquqi asoslari",
          excerpt_uz: "O'zbekiston Respublikasi korporativ qonunchiligining asosiy normalariga sharh",
          content_uz: "<p>O'zbekistonning korporativ huquqi yuridik shaxslarning tashkil etilishi, faoliyati va tugatilishini tartibga soladi.</p><h2>Asosiy manbalar</h2><p>O'zbekiston Respublikasi Fuqarolik kodeksi korporativ huquqning asosiy manbai hisoblanadi.</p>",
        },
        {
          slug: "nalogovye-lgoty-it",
          title_uz: "IT-kompaniyalar uchun soliq imtiyozlari",
          excerpt_uz: "Axborot texnologiyalari sohasidagi kompaniyalar uchun soliq imtiyozlari tahlili",
          content_uz: "<p>O'zbekistondagi IT-kompaniyalar bir qator soliq imtiyozlaridan foydalanishlari mumkin.</p><h2>Asosiy imtiyozlar</h2><p>IT Park rezidentlari foyda solig'i, QQS, mulk solig'i va yer solig'idan ozod qilinadi.</p>",
        },
        {
          slug: "antimonopolnoe-regulirovanie",
          title_uz: "Antimonopoliya tartibga solish: yangi qoidalar",
          excerpt_uz: "Antimonopoliya qonunchiligiga kiritilgan so'nggi o'zgarishlarga sharh",
          content_uz: "<p>O'zbekiston antimonopoliya qonunchiligi jiddiy o'zgarishlarga uchradi.</p><h2>Asosiy o'zgarishlar</h2><p>Yangi qoidalar bozordagi ustun mavqeni suiiste'mol qilish uchun javobgarlikni kuchaytiradi.</p>",
        },
      ];

      for (const def of defaultPostsUz) {
        await Post.updateOne(
          { slug: def.slug },
          { $set: { title_uz: def.title_uz, excerpt_uz: def.excerpt_uz, content_uz: def.content_uz } }
        );
      }
      console.log(`Posts migrated: ${postsWithoutUz.length} posts updated with _uz fields`);
    }
  }

  // Ensure admin user exists
  const existing = await User.findOne({ email: "admin@example.com" });
  if (!existing) {
    await User.createUser({
      email: "admin@example.com",
      password: "admin123",
      name: "Администратор",
      role: "admin",
    });
    console.log("Default admin user created: admin@example.com / admin123");
  }
};

// SPA catch-all route — serve index.html for all non-API routes (production only)
if (isProduction) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
  });
}

// Start server
const start = async () => {
  await connectDB();
  await seedData();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (${isProduction ? "production" : "development"})`);
  });
};

start();
