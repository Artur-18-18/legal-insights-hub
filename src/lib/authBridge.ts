/**
 * Источник токена для api.ts: сначала React state (AuthContext), иначе localStorage.
 * Избегает 401, когда контекст уже обновлён, а getAuthHeaders читает устаревшее хранилище.
 */
let tokenSource: () => string | null = () =>
  typeof localStorage !== "undefined" ? localStorage.getItem("admin_token") : null;

export function registerAdminTokenSource(fn: () => string | null) {
  tokenSource = fn;
}

export function getAdminToken(): string | null {
  try {
    const t = tokenSource();
    return t?.trim() || null;
  } catch {
    return typeof localStorage !== "undefined" ? localStorage.getItem("admin_token")?.trim() || null : null;
  }
}
