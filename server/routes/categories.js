import express from "express";
import auth from "../middleware/auth.js";
import {
  listCategories,
  findCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  isUniqueConstraintError,
} from "../database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json(listCategories());
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения категорий" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const category = findCategoryBySlug(req.params.slug);
    if (!category) return res.status(404).json({ error: "Категория не найдена" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения категории" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, name_uz, slug, description, description_uz, icon } = req.body;
    const category = createCategory({
      name,
      name_uz,
      slug,
      description,
      description_uz,
      icon,
    });
    res.status(201).json(category);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(400).json({ error: "Такой slug уже существует" });
    }
    res.status(500).json({ error: "Ошибка создания категории" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const category = updateCategory(req.params.id, req.body);
    if (!category) return res.status(404).json({ error: "Категория не найдена" });
    res.json(category);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(400).json({ error: "Такой slug уже существует" });
    }
    res.status(500).json({ error: "Ошибка обновления категории" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const ok = deleteCategory(req.params.id);
    if (!ok) return res.status(404).json({ error: "Категория не найдена" });
    res.json({ message: "Категория удалена" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка удаления категории" });
  }
});

export default router;
