import express from "express";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserById,
  comparePassword,
} from "../database.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const isMatch = await comparePassword(user, password);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const idStr = String(user.id);
    const token = jwt.sign(
      { id: idStr, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || "secret-key-change-in-production",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: { id: idStr, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера при входе" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Нет токена" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret-key-change-in-production");
    const user = findUserById(decoded.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const idStr = String(user.id);
    res.json({
      user: { id: idStr, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(401).json({ error: "Неверный токен" });
  }
});

export default router;
