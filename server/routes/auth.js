import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Seed default admin user
const seedAdminUser = async () => {
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

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    await seedAdminUser();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret-key-change-in-production",
      { expiresIn: "24h" }
    );

    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
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
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(401).json({ error: "Неверный токен" });
  }
});

export default router;
