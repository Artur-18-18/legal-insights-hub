/**
 * Decodes a JWT payload with correct UTF-8 handling.
 * Using atob() + JSON.parse() on the raw string breaks non-ASCII (e.g. Cyrillic in name).
 */
export function decodeJwtPayload<T extends Record<string, unknown>>(token: string): T | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
