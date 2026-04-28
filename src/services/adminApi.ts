import { apiUrl } from "@/config/api";

export const ADMIN_SESSION_STORAGE_KEY = "moments_admin_token";
export const ADMIN_SESSION_CHANGED_EVENT = "moments-admin-session-changed";

export type AdminRole = "ADMIN" | "STAFF";

export interface AdminSession {
  id?: string;
  name: string;
  email: string;
  role: AdminRole;
  token: string;
  refreshToken?: string;
}

type AuthResponse = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  name?: string;
  email?: string;
  role?: AdminRole | string;
  user?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: AdminRole | string;
    roles?: string[];
  };
};

const EXPIRY_SKEW_MS = 30_000;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifySessionChanged(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string | undefined, skewMs = EXPIRY_SKEW_MS): boolean {
  if (!token) return true;
  if (!isBrowser()) return false;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now() + skewMs;
}

export function getJwtExpiresAt(token: string | undefined): number | null {
  if (!token || !isBrowser()) return null;
  const payload = decodeJwtPayload(token);
  return payload?.exp ? payload.exp * 1000 : null;
}

export function isAdminRole(role: unknown): role is AdminRole {
  return role === "ADMIN" || role === "STAFF";
}

function normalizeRole(data: AuthResponse, fallback?: AdminRole): AdminRole | null {
  const direct = String(data.user?.role ?? data.role ?? "").replace(/^ROLE_/, "");
  if (isAdminRole(direct)) return direct;

  const roles = data.user?.roles ?? [];
  if (roles.some((role) => role === "ROLE_ADMIN" || role === "ADMIN")) return "ADMIN";
  if (roles.some((role) => role === "ROLE_STAFF" || role === "STAFF")) return "STAFF";

  return fallback ?? null;
}

export function normalizeAdminSession(data: AuthResponse, fallback?: Partial<AdminSession>): AdminSession {
  const token = data.accessToken ?? data.token ?? fallback?.token;
  const email = data.user?.email ?? data.email ?? fallback?.email;
  const firstName = data.user?.firstName?.trim() ?? "";
  const lastName = data.user?.lastName?.trim() ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  if (!token || !email) {
    throw new Error("Authentication response was missing required session details");
  }

  const role = normalizeRole(data, fallback?.role);
  if (!role) {
    throw new Error("This account is not authorised for the admin dashboard");
  }

  const session: AdminSession = {
    id: data.user?.id ?? fallback?.id,
    token,
    refreshToken: data.refreshToken ?? fallback?.refreshToken,
    name: data.user?.name ?? (fullName || undefined) ?? data.name ?? fallback?.name ?? email,
    email,
    role,
  };

  return session;
}

export function readAdminSession(): AdminSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.token || !isAdminRole(parsed.role)) return null;
    return parsed;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function writeAdminSession(session: AdminSession): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
  notifySessionChanged();
}

export function clearAdminSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  notifySessionChanged();
}

export async function refreshAdminSession(session = readAdminSession()): Promise<AdminSession | null> {
  if (!session?.refreshToken) return null;

  const res = await fetch(apiUrl("/api/v1/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.refreshToken}`,
    },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  if (!res.ok) return null;

  const next = normalizeAdminSession((await res.json()) as AuthResponse, session);
  writeAdminSession(next);
  return next;
}

export async function getValidAdminSession(): Promise<AdminSession | null> {
  const session = readAdminSession();
  if (!session) return null;
  if (!isJwtExpired(session.token)) return session;
  const refreshed = await refreshAdminSession(session);
  if (!refreshed) clearAdminSession();
  return refreshed;
}

export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const session = await getValidAdminSession();
  if (!session) throw new Error("Admin session expired. Please sign in again.");

  const makeRequest = (token: string) => fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  let res = await makeRequest(session.token);
  if (res.status === 401) {
    const refreshed = await refreshAdminSession(session);
    if (refreshed) res = await makeRequest(refreshed.token);
  }

  if (res.status === 401 || res.status === 403) {
    clearAdminSession();
    throw new Error(res.status === 403 ? "Admin access is not authorised." : "Admin session expired. Please sign in again.");
  }

  return res;
}