import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiUrl } from "@/config/api";
import { mapBackendRole } from "@/services/adminApi";

// ---------------------------------------------------------------------------
// AdminUser — shape stored in localStorage and exposed to the app.
// Backend sends firstName + lastName separately — we join them here.
// ---------------------------------------------------------------------------
export interface AdminUser {
  id?: string;
  name: string;         // firstName + " " + lastName (or email as fallback)
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
      if (parsed?.token) setUser(parsed);
    } catch {
      // corrupt storage — ignore
    }
  }, []);

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

    // -----------------------------------------------------------------------
    // Backend AuthResponse shape:
    // {
    //   "accessToken": "...",
    //   "refreshToken": "...",
    //   "user": {
    //     "id": "uuid",
    //     "email": "...",
    //     "firstName": "...",
    //     "lastName": "...",
    //     "roles": ["ROLE_ADMIN"]   ← Set<Role> serialised as array
    //   }
    // }
    // -----------------------------------------------------------------------
    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
      token?: string;               // some impls hoist it
      user?: {
        id?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        name?: string;              // already-joined fallback
        roles?: string[];
        role?: string;
      };
      // flat fallbacks
      name?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      roles?: string[];
      role?: string;
    };

    const token = data.accessToken ?? data.token;
    if (!token) throw new Error("Login response did not include an access token");

    // Resolve display name: prefer firstName + lastName, then any name field, then email
    const firstName     = data.user?.firstName ?? data.firstName ?? "";
    const lastName      = data.user?.lastName  ?? data.lastName  ?? "";
    const joinedName    = [firstName, lastName].filter(Boolean).join(" ");
    const resolvedEmail = data.user?.email ?? data.email ?? email;
    const displayName   = joinedName || data.user?.name || data.name || resolvedEmail;

    // Resolve role: backend sends Set<Role> as array e.g. ["ROLE_ADMIN"]
    const rolesArray: string[] =
      data.user?.roles ??
      (data.user?.role  ? [data.user.role]  : null) ??
      data.roles ??
      (data.role        ? [data.role]        : []);

    const next: AdminUser = {
      id:           data.user?.id,
      token,
      refreshToken: data.refreshToken,
      name:         displayName,
      email:        resolvedEmail,
      role:         mapBackendRole(rolesArray),
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