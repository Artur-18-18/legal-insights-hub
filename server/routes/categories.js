import express from "express";
import Category from "../models/Category.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/categories — public
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения категорий" });
  }
});

// GET /api/categories/:slug — public
router.get("/:slug", async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ error: "Категория не найдена" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения категории" });
  }
});

// POST /api/categories — admin only
router.post("/", auth, async (req, res) => {
  try {
    const { name, slug, description, icon } = req.body;
    const category = await Category.create({ name, slug, description, icon });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: "Такой slug уже существует" });
    res.status(500).json({ error: "Ошибка создания категории" });
  }
});

// PUT /api/categories/:id — admin only
router.put("/:id", auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ error: "Категория не найдена" });
    res.json(category);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: "Такой slug уже существует" });
    res.status(500).json({ error: "Ошибка обновления категории" });
  }
});

// DELETE /api/categories/:id — admin only
router.delete("/:id", auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: "Категория не найдена" });
    res.json({ message: "Категория удалена" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка удаления категории" });
  }
});

export default router;
