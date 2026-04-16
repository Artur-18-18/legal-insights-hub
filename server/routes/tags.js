import express from "express";
import auth from "../middleware/auth.js";
import {
  listTags,
  createTag,
  updateTag,
  deleteTag,
  isUniqueConstraintError,
} from "../database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json(listTags());
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения тегов" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name, name_uz, slug } = req.body;
    const tag = createTag({ name, name_uz, slug });
    res.status(201).json(tag);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(400).json({ error: "Такой slug уже существует" });
    }
    res.status(500).json({ error: "Ошибка создания тега" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const tag = updateTag(req.params.id, req.body);
    if (!tag) return res.status(404).json({ error: "Тег не найден" });
    res.json(tag);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(400).json({ error: "Такой slug уже существует" });
    }
    res.status(500).json({ error: "Ошибка обновления тега" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const ok = deleteTag(req.params.id);
    if (!ok) return res.status(404).json({ error: "Тег не найден" });
    res.json({ message: "Тег удалён" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка удаления тега" });
  }
});

export default router;
