import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiUrl } from "@/config/api";
import {
  ADMIN_SESSION_CHANGED_EVENT,
  clearAdminSession,
  getJwtExpiresAt,
  getValidAdminSession,
  normalizeAdminSession,
  readAdminSession,
  writeAdminSession,
  type AdminSession,
} from "@/services/adminApi";

export type AdminUser = AdminSession;

interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  ensureValidSession: () => Promise<AdminUser | null>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const ensureValidSession = useCallback(async (): Promise<AdminUser | null> => {
    const session = await getValidAdminSession();
    setUser(session);
    return session;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUser(readAdminSession());

    const syncSession = () => setUser(readAdminSession());
    window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, syncSession);
    window.addEventListener("storage", syncSession);

    void getValidAdminSession().then((session) => {
      setUser(session);
      setIsCheckingSession(false);
    });

    return () => {
      window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  useEffect(() => {
    if (!user?.token) return;
    const expiresAt = getJwtExpiresAt(user.token);
    if (!expiresAt) return;

    const timeout = window.setTimeout(() => {
      void ensureValidSession();
    }, Math.max(expiresAt - Date.now() - 30_000, 0));

    return () => window.clearTimeout(timeout);
  }, [ensureValidSession, user?.token]);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await fetch(apiUrl("/api/v1/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = "Login failed";
      try {
        const data = (await res.json()) as { message?: string; error?: string };
        message = data.message ?? data.error ?? message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    const next = normalizeAdminSession(await res.json(), { email });
    setUser(next);
    writeAdminSession(next);
  };

  const logout = (): void => {
    setUser(null);
    clearAdminSession();
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, isCheckingSession, login, logout, ensureValidSession }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
