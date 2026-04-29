import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ADMIN_LOGOUT_EVENT,
  ADMIN_REFRESH_INTERVAL_MS,
  ADMIN_SESSION_CHANGED_EVENT,
  getValidAdminSession,
  loginAdmin,
  logoutAdmin,
  readAdminSession,
  type AdminSession,
} from "@/services/adminApi";

export type AdminUser = AdminSession;

interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  isAdmin: boolean;
  isStaff: boolean;
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
    const syncLogout = () => setUser(null);
    window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, syncSession);
    window.addEventListener(ADMIN_LOGOUT_EVENT, syncLogout);
    window.addEventListener("storage", syncSession);

    void getValidAdminSession().then((session) => {
      setUser(session);
      setIsCheckingSession(false);
    });

    return () => {
      window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, syncSession);
      window.removeEventListener(ADMIN_LOGOUT_EVENT, syncLogout);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  useEffect(() => {
    if (!user?.refreshToken) return;
    const interval = window.setInterval(() => {
      void ensureValidSession();
    }, ADMIN_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [ensureValidSession, user?.refreshToken]);

  const login = async (email: string, password: string): Promise<void> => {
    const next = await loginAdmin(email, password);
    setUser(next);
  };

  const logout = (): void => {
    setUser(null);
    void logoutAdmin();
  };

  const value = useMemo<AdminAuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isCheckingSession,
    isAdmin: !!user?.roles.includes("ROLE_ADMIN"),
    isStaff: !!user?.roles.includes("ROLE_STAFF"),
    login,
    logout,
    ensureValidSession,
  }), [ensureValidSession, isCheckingSession, user]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAuth must be used within AdminAuthProvider");
  return ctx;
}

export const useAdminAuth = useAuth;
