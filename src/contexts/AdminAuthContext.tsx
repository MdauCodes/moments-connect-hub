import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface AdminUser {
  id?: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  token: string;
  refreshToken?: string;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "moments_admin_token";

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AdminUser;
      if (parsed && parsed.token) {
        setUser(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
    const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
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

    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
      token?: string;
      name?: string;
      email?: string;
      role?: "ADMIN" | "STAFF";
      user?: {
        id?: string;
        name: string;
        email: string;
        role?: "ADMIN" | "STAFF";
        roles?: string[];
      };
    };

    const roleFromResponse = data.user?.role ?? data.role;
    const roleFromRoles = data.user?.roles?.includes("ROLE_ADMIN") ? "ADMIN" : "STAFF";
    const token = data.accessToken ?? data.token;

    if (!token || !data.user?.email && !data.email) {
      throw new Error("Login response was missing required user details");
    }

    const next: AdminUser = {
      id: data.user?.id,
      token,
      refreshToken: data.refreshToken,
      name: data.user?.name ?? data.name ?? data.user?.email ?? data.email ?? "Admin",
      email: data.user?.email ?? data.email ?? email,
      role: roleFromResponse ?? roleFromRoles,
    };
    setUser(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const logout = (): void => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
