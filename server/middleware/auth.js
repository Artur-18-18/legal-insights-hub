import jwt from "jsonwebtoken";

function getJwtSecret() {
  return process.env.JWT_SECRET || "secret-key-change-in-production";
}

/** Токен из Authorization: Bearer … или резервно X-Access-Token (если прокси режет Authorization). */
function extractAccessToken(req) {
  const auth = req.headers.authorization;
  if (typeof auth === "string") {
    const m = auth.match(/^Bearer\s+(\S+)/i);
    if (m?.[1]) return m[1];
  }
  const x = req.headers["x-access-token"];
  if (typeof x === "string" && x.trim()) return x.trim();
  return null;
}

const authMiddleware = (req, res, next) => {
  const token = extractAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: "Нет токена авторизации" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Неверный или просроченный токен" });
  }
};

export default authMiddleware;
