import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { decodeJwtPayload } from "@/lib/jwtPayload";
import { registerAdminTokenSource } from "@/lib/authBridge";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));
  const [user, setUser] = useState<User | null>(null);

  // Синхронно перед дочерними компонентами — api.getAdminToken() всегда актуален при сабмите форм
  registerAdminTokenSource(() => token?.trim() || localStorage.getItem("admin_token")?.trim() || null);

  // Декодим JWT для отображения имени; при ошибке декода не удаляем токен — проверка на сервере
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    const payload = decodeJwtPayload<{
      id?: string;
      email?: string;
      name?: string;
      role?: string;
    }>(token);
    if (payload) {
      setUser({
        id: payload.id || "1",
        email: payload.email ?? "",
        name: typeof payload.name === "string" ? payload.name : "",
        role: payload.role || "admin",
      });
    } else {
      setUser({
        id: "1",
        email: "",
        name: "",
        role: "admin",
      });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "same-origin",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Ошибка входа" }));
      throw new Error(error.error || "Неверный email или пароль");
    }

    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("admin_token", data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("admin_token");
    fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
