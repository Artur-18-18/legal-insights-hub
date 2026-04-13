import express from "express";
import Tag from "../models/Tag.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/tags — public
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения тегов" });
  }
});

// POST /api/tags — admin only
router.post("/", auth, async (req, res) => {
  try {
    const { name, slug } = req.body;
    const tag = await Tag.create({ name, slug });
    res.status(201).json(tag);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: "Такой slug уже существует" });
    res.status(500).json({ error: "Ошибка создания тега" });
  }
});

// PUT /api/tags/:id — admin only
router.put("/:id", auth, async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tag) return res.status(404).json({ error: "Тег не найден" });
    res.json(tag);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: "Такой slug уже существует" });
    res.status(500).json({ error: "Ошибка обновления тега" });
  }
});

// DELETE /api/tags/:id — admin only
router.delete("/:id", auth, async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) return res.status(404).json({ error: "Тег не найден" });
    res.json({ message: "Тег удалён" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка удаления тега" });
  }
});

export default router;
