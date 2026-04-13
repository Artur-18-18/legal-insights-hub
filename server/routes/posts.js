import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/posts — public (для сайта)
router.get("/", async (req, res) => {
  try {
    const { published, category, tag, search } = req.query;
    const query = {};
    if (published !== undefined) query.published = published === "true";
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { title_uz: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { content_uz: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { excerpt_uz: { $regex: search, $options: "i" } },
      ];
    }
    const posts = await Post.find(query)
      .populate("category", "name name_uz slug icon")
      .populate("tags", "name name_uz slug")
      .sort({ created_at: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения постов" });
  }
});

// GET /api/posts/:slug — public
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate("category", "name name_uz slug icon")
      .populate("tags", "name name_uz slug");
    if (!post) return res.status(404).json({ error: "Пост не найден" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения поста" });
  }
});

// GET /api/posts/admin/all — admin only
router.get("/admin/all", auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("category", "name name_uz slug")
      .populate("tags", "name name_uz slug")
      .sort({ created_at: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения постов" });
  }
});

// POST /api/posts — admin only
router.post("/", auth, async (req, res) => {
  try {
    const { title, title_uz, slug, excerpt, excerpt_uz, content, content_uz, featured_image, author_name, published, legislation_links, category, tags, post_images } = req.body;
    const post = await Post.create({
      title, title_uz, slug, excerpt, excerpt_uz, content, content_uz, featured_image, author_name, published, legislation_links, category, tags, post_images,
    });
    const populated = await Post.findById(post._id)
      .populate("category", "name name_uz slug icon")
      .populate("tags", "name name_uz slug");
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: "Такой slug уже существует" });
    res.status(500).json({ error: "Ошибка создания поста" });
  }
});

// PUT /api/posts/:id — admin only
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: Date.now() },
      { new: true, runValidators: true }
    )
      .populate("category", "name slug icon")
      .populate("tags", "name slug");
    if (!post) return res.status(404).json({ error: "Пост не найден" });
    res.json(post);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: "Такой slug уже существует" });
    res.status(500).json({ error: "Ошибка обновления поста" });
  }
});

// DELETE /api/posts/:id — admin only
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Пост не найден" });
    res.json({ message: "Пост удалён" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка удаления поста" });
  }
});

export default router;
