import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { apiUrl, setAuthToken, getAuthToken } from "@/config/api";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isStaff: boolean;
  isAdmin: boolean;

  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const RT_KEY = "mpk_rt";
const REFRESH_INTERVAL_MS = 840_000; // 14 min

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Module-scoped access token mirror (kept in sync with localStorage)
let accessTokenMem: string | null = null;
export function getAccessToken(): string | null {
  return accessTokenMem ?? getAuthToken();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(getAuthToken());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setAccessToken = (token: string | null) => {
    accessTokenMem = token;
    setAuthToken(token);
    setAccessTokenState(token);
  };

  const refreshToken = useCallback(async (): Promise<string | null> => {
    const rt = typeof window !== "undefined" ? window.localStorage.getItem(RT_KEY) : null;
    if (!rt) return null;
    try {
      const res = await fetch(apiUrl("/api/v1/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) throw new Error("refresh failed");
      const data = await res.json();
      if (data.accessToken) setAccessToken(data.accessToken);
      if (data.refreshToken) window.localStorage.setItem(RT_KEY, data.refreshToken);
      if (data.user) setUser(data.user);
      return data.accessToken ?? null;
    } catch {
      setAccessToken(null);
      setUser(null);
      try {
        window.localStorage.removeItem(RT_KEY);
      } catch {
        /* ignore */
      }
      return null;
    }
  }, []);

  // Try refresh on mount if refresh token exists
  useEffect(() => {
    const rt = typeof window !== "undefined" ? window.localStorage.getItem(RT_KEY) : null;
    if (rt) refreshToken();
  }, [refreshToken]);

  // Auto-refresh interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!accessToken) return;
    intervalRef.current = setInterval(() => {
      refreshToken();
    }, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [accessToken, refreshToken]);

  const login = async (email: string, password: string) => {
    const res = await fetch(apiUrl("/api/v1/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Login failed");
    }
    const data = await res.json();
    if (data.accessToken) setAccessToken(data.accessToken);
    if (data.refreshToken) {
      try {
        window.localStorage.setItem(RT_KEY, data.refreshToken);
      } catch {
        /* ignore */
      }
    }
    if (data.user) setUser(data.user);
  };

  const logout = async () => {
    const rt = typeof window !== "undefined" ? window.localStorage.getItem(RT_KEY) : null;
    try {
      await fetch(apiUrl("/api/v1/auth/logout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    setUser(null);
    try {
      window.localStorage.removeItem(RT_KEY);
    } catch {
      /* ignore */
    }
  };

  const roles = user?.roles ?? [];
  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isCustomer: roles.includes("ROLE_CUSTOMER"),
    isStaff: roles.includes("ROLE_STAFF"),
    isAdmin: roles.includes("ROLE_ADMIN"),
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/**
 * authFetch — wraps fetch and handles 401 by refresh+retry once.
 */
export async function authFetch(
  input: string,
  init: RequestInit = {},
  refresh?: () => Promise<string | null>,
  onAuthFailed?: () => void,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessTokenMem) headers.set("Authorization", `Bearer ${accessTokenMem}`);
  let res = await fetch(input, { ...init, headers });
  if (res.status !== 401 || !refresh) return res;
  const newToken = await refresh();
  if (!newToken) {
    onAuthFailed?.();
    return res;
  }
  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", `Bearer ${newToken}`);
  res = await fetch(input, { ...init, headers: retryHeaders });
  if (res.status === 401) onAuthFailed?.();
  return res;
}
