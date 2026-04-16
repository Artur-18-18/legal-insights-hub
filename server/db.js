import { initDatabase } from "./database.js";

/** Подключение к SQLite (синхронно через better-sqlite3). */
export default async function connectDB() {
  initDatabase();
}
