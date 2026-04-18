import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

import connectDB from "./db.js";
import { getStats, seedDatabase } from "./database.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import categoryRoutes from "./routes/categories.js";
import tagRoutes from "./routes/tags.js";
import translateRoutes from "./routes/translate.js";

const app = express();

const PORT = process.env.PORT || process.env.SERVER_PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

const corsOptions = {
  // Отражаем Origin запроса — и localhost, и 127.0.0.1 в dev, и прод с одного хоста
  origin: true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Access-Token"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/translate", translateRoutes);

app.get("/api/stats", async (req, res) => {
  try {
    res.json(getStats());
  } catch (error) {
    res.json({ posts: 0, drafts: 0, categories: 0, tags: 0 });
  }
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, "..", "dist"), { maxAge: "1d" }));
  app.get("{*path}", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
  });
}

const start = async () => {
  await connectDB();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (${isProduction ? "production" : "development"})`);
  });
};

start();
