// ----------------------------------------------------------------------------
// adminApi.ts — authenticated admin service layer
// Place at:  src/services/adminApi.ts
//
// Covers every /api/v1/admin/* endpoint the frontend needs today:
//   • users   (CRUD, ADMIN-only)
//   • enquiries (list / get / patch-status, STAFF+ADMIN)
//
// Shape contract (backend DTOs as of the current Spring Boot codebase):
//   UserDto       → id(UUID), email, firstName, lastName, enabled,
//                   roles: Set<Role>  (ROLE_ADMIN | ROLE_STAFF),
//                   createdAt, updatedAt
//   EnquiryDto    → id, reference, persona, contact{name,email,phone,company},
//                   message, source, status(EnquiryStatus enum),
//                   assignedTo, internalNotes,
//                   items[EnquiryItemDto], createdAt, updatedAt
//   EnquiryStatus → NEW | REVIEWING | QUOTED | WON | LOST | SPAM
// ----------------------------------------------------------------------------

import { apiUrl } from "@/config/api";

// ---------------------------------------------------------------------------
// Auth helper — reads JWT from localStorage (same key as AdminAuthContext)
// ---------------------------------------------------------------------------
function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  try {
    const raw = localStorage.getItem("moments_admin_token");
    const token = raw ? (JSON.parse(raw) as { token?: string }).token : undefined;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } catch {
    return { "Content-Type": "application/json" };
  }
}

// Core fetch wrapper — throws a readable Error on non-2xx
async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(`/api/v1/admin${path}`), {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });

  if (!res.ok) {
    let message = `Admin API error: ${res.status}`;
    try {
      const err = (await res.json()) as { message?: string; error?: string };
      message = err.message ?? err.error ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Build a ?query string, skipping undefined / null / ""
function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

// ---------------------------------------------------------------------------
// Shared backend types
// ---------------------------------------------------------------------------

/** Raw role strings from the Spring Boot Role enum */
export type BackendRole = "ROLE_ADMIN" | "ROLE_STAFF";

/**
 * Converts the backend's Set<Role> (e.g. ["ROLE_ADMIN"]) to the simple
 * "ADMIN" | "STAFF" discriminant used everywhere in the frontend.
 */
export function mapBackendRole(roles: string[]): "ADMIN" | "STAFF" {
  if (!Array.isArray(roles) || roles.length === 0) return "STAFF";
  const upper = roles.map((r) => String(r).toUpperCase());
  return upper.some((r) => r === "ROLE_ADMIN" || r === "ADMIN") ? "ADMIN" : "STAFF";
}

// ---------------------------------------------------------------------------
// User types
// ---------------------------------------------------------------------------

/** Raw shape returned by GET /api/v1/admin/users (backend UserDto) */
export interface RawUserDto {
  id: string;           // UUID string
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: BackendRole[];
  createdAt: string;    // ISO-8601 instant
  updatedAt: string;
}

/**
 * Normalized user — adds computed `name` and `role` so every consumer in the
 * app gets one consistent shape instead of dealing with firstName/lastName
 * and BackendRole[] separately.
 */
export interface AdminUserDto extends RawUserDto {
  /** firstName + lastName joined, falls back to email */
  name: string;
  /** Simplified role discriminant */
  role: "ADMIN" | "STAFF";
}

export interface UserCreateRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  /** Must be non-empty per backend validation */
  roles: BackendRole[];
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  roles?: BackendRole[];
  /** Min 8 chars if provided */
  password?: string;
}

function normalizeUser(raw: RawUserDto): AdminUserDto {
  return {
    ...raw,
    name: [raw.firstName, raw.lastName].filter(Boolean).join(" ") || raw.email,
    role: mapBackendRole(raw.roles),
  };
}

// ---------------------------------------------------------------------------
// Enquiry types
// ---------------------------------------------------------------------------

export type EnquiryStatus =
  | "NEW"
  | "REVIEWING"
  | "QUOTED"
  | "WON"
  | "LOST"
  | "SPAM";

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  REVIEWING: "Reviewing",
  QUOTED: "Quoted",
  WON: "Won",
  LOST: "Lost",
  SPAM: "Spam",
};

export interface EnquiryContactDto {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
}

export interface EnquiryItemDto {
  id: string;
  productId: string | null;
  productName: string | null;
  size: string | null;
  material: string | null;
  finish: string | null;
  quantity: number | null;
  notes: string | null;
}

export interface EnquiryDto {
  id: string;
  reference: string;
  persona: string | null;
  contact: EnquiryContactDto;
  message: string | null;
  source: string | null;
  status: EnquiryStatus;
  assignedTo: string | null;
  internalNotes: string | null;
  items: EnquiryItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryStatusUpdateRequest {
  status?: EnquiryStatus;
  assignedTo?: string;
  internalNotes?: string;
}

// ---------------------------------------------------------------------------
// Pagination wrapper — matches backend PageResponse<T>
// ---------------------------------------------------------------------------
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// ---------------------------------------------------------------------------
// adminApi — grouped by resource
// ---------------------------------------------------------------------------

export const adminApi = {

  // -------------------------------------------------------------------------
  // Users / Staff  (@IsAdmin on all routes)
  // GET    /api/v1/admin/users
  // GET    /api/v1/admin/users/{id}
  // POST   /api/v1/admin/users
  // PATCH  /api/v1/admin/users/{id}
  // DELETE /api/v1/admin/users/{id}
  // -------------------------------------------------------------------------
  users: {
    list: async (): Promise<AdminUserDto[]> => {
      const data = await adminFetch<RawUserDto[]>("/users");
      return data.map(normalizeUser);
    },

    getById: async (id: string): Promise<AdminUserDto> => {
      const data = await adminFetch<RawUserDto>(`/users/${encodeURIComponent(id)}`);
      return normalizeUser(data);
    },

    create: async (request: UserCreateRequest): Promise<AdminUserDto> => {
      const data = await adminFetch<RawUserDto>("/users", {
        method: "POST",
        body: JSON.stringify(request),
      });
      return normalizeUser(data);
    },

    update: async (id: string, request: UserUpdateRequest): Promise<AdminUserDto> => {
      const data = await adminFetch<RawUserDto>(`/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(request),
      });
      return normalizeUser(data);
    },

    remove: async (id: string): Promise<void> => {
      await adminFetch<void>(`/users/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  },

  // -------------------------------------------------------------------------
  // Enquiries  (@IsStaffOrAdmin on all routes)
  // GET   /api/v1/admin/enquiries?status=&page=&size=&sort=
  // GET   /api/v1/admin/enquiries/{id}
  // PATCH /api/v1/admin/enquiries/{id}
  // -------------------------------------------------------------------------
  enquiries: {
    list: async (params?: {
      status?: EnquiryStatus;
      page?: number;
      size?: number;
    }): Promise<PageResponse<EnquiryDto>> => {
      const query = qs({
        ...(params?.status ? { status: params.status } : {}),
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sort: "createdAt,desc",
      });
      return adminFetch<PageResponse<EnquiryDto>>(`/enquiries${query}`);
    },

    getById: async (id: string): Promise<EnquiryDto> => {
      return adminFetch<EnquiryDto>(`/enquiries/${encodeURIComponent(id)}`);
    },

    updateStatus: async (
      id: string,
      request: EnquiryStatusUpdateRequest,
    ): Promise<EnquiryDto> => {
      return adminFetch<EnquiryDto>(`/enquiries/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(request),
      });
    },
  },
};