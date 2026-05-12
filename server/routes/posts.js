import express from "express";
import auth from "../middleware/auth.js";
import {
  findPosts,
  findPostBySlug,
  findPostById,
  createPost,
  updatePost,
  deletePost,
  isUniqueConstraintError,
} from "../database.js";

const router = express.Router();

// GET /api/posts — public
router.get("/", async (req, res) => {
  try {
    const posts = findPosts(req.query);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения постов" });
  }
});

const adminAllPosts = async (req, res) => {
  try {
    const posts = findPosts({});
    res.json(posts);
  } catch (error) {
    console.error("adminAllPosts / findPosts:", error);
    res.status(500).json({
      error: error?.message ? String(error.message) : "Ошибка получения постов",
    });
  }
};

// GET /api/posts/admin/all — admin only (совместимость)
router.get("/admin/all", auth, adminAllPosts);

// POST /api/posts/admin/list — то же самое (клиент использует POST: надёжнее с прокси и Authorization)
router.post("/admin/list", auth, adminAllPosts);

// POST /api/posts/admin/create — создание (явный путь; до GET /:slug)
router.post("/admin/create", auth, async (req, res) => {
  try {
    const post = createPost(req.body);
    res.status(201).json(post);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(400).json({ error: "Такой slug уже существует" });
    }
    console.error("POST /api/posts/admin/create error:", error);
    res.status(500).json({ error: "Ошибка создания поста" });
  }
});

// PUT /api/posts/admin/:id — обновление (явный путь)
router.put("/admin/:id", auth, async (req, res) => {
  try {
    const post = updatePost(req.params.id, req.body);
    if (!post) return res.status(404).json({ error: "Пост не найден" });
    res.json(post);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(400).json({ error: "Такой slug уже существует" });
    }
    res.status(500).json({ error: "Ошибка обновления поста" });
  }
});

// GET /api/posts/admin/post/:id — пост по id для редактирования
router.get("/admin/post/:id", auth, async (req, res) => {
  try {
    const post = findPostById(req.params.id);
    if (!post) return res.status(404).json({ error: "Пост не найден" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения поста" });
  }
});

// GET /api/posts/:slug — public
router.get("/:slug", async (req, res) => {
  try {
    const post = findPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ error: "Пост не найден" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения поста" });
  }
});

// POST /api/posts — admin only
router.post("/", auth, async (req, res) => {
  try {
    const post = createPost(req.body);
    res.status(201).json(post);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(400).json({ error: "Такой slug уже существует" });
    }
    console.error("POST /api/posts error:", error);
    res.status(500).json({ error: "Ошибка создания поста" });
  }
});

// PUT /api/posts/:id — admin only
router.put("/:id", auth, async (req, res) => {
  try {
    const post = updatePost(req.params.id, req.body);
    if (!post) return res.status(404).json({ error: "Пост не найден" });
    res.json(post);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(400).json({ error: "Такой slug уже существует" });
    }
    res.status(500).json({ error: "Ошибка обновления поста" });
  }
});

// DELETE /api/posts/:id — admin only
router.delete("/:id", auth, async (req, res) => {
  try {
    const ok = deletePost(req.params.id);
    if (!ok) return res.status(404).json({ error: "Пост не найден" });
    res.json({ message: "Пост удалён" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка удаления поста" });
  }
});

export default router;
