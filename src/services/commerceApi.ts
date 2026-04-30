// ----------------------------------------------------------------------------
// E-commerce admin API client.
//
// Strategy: try the real backend first; if the endpoint is missing (404), the
// network fails, or returns an unexpected shape, transparently fall back to
// deterministic mock data so the admin UI is fully visualisable without the
// Spring Boot backend running.
//
// Each successful real response is cached in-memory for 60s as a "real backend
// is alive" hint, so we don't keep paying the 404 round-trip cost.
// ----------------------------------------------------------------------------

import { adminFetch, ApiError } from "@/services/adminApi";
import {
  dashboardStatsMock,
  getOrderMock,
  listOrdersMock,
  listPaymentsMock,
  updateOrderStatusMock,
  type DashboardStats,
  type OrderRecord,
  type OrderStatus,
  type PaymentRecord,
} from "@/services/commerceMock";

type Source = "live" | "mock";
const ALIVE_TTL_MS = 60_000;
const aliveCache = new Map<string, number>();

function isAlive(scope: string): boolean {
  const t = aliveCache.get(scope);
  return !!t && Date.now() - t < ALIVE_TTL_MS;
}
function markAlive(scope: string) {
  aliveCache.set(scope, Date.now());
}

async function tryLive<T>(scope: string, path: string): Promise<T | null> {
  try {
    const res = await adminFetch(path);
    if (res.status === 404) return null;
    if (!res.ok) {
      // 5xx etc — treat as unavailable, fall back to mock
      return null;
    }
    const json = (await res.json()) as T;
    markAlive(scope);
    return json;
  } catch (err) {
    // Auth errors should still bubble (they hit beforeLoad guards), other
    // network errors silently fall back.
    if (err instanceof ApiError && err.status === 401) throw err;
    return null;
  }
}

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ---------- Orders ----------

export interface ListOrdersParams {
  status?: string;
  q?: string;
  page?: number;
  size?: number;
}

export interface ListOrdersResult {
  rows: OrderRecord[];
  total: number;
  totalPages: number;
  source: Source;
}

export async function listOrders(params: ListOrdersParams = {}): Promise<ListOrdersResult> {
  const live = await tryLive<{ content?: OrderRecord[]; totalElements?: number; totalPages?: number } | OrderRecord[]>(
    "orders",
    `/api/v1/admin/orders${qs(params as Record<string, unknown>)}`,
  );
  if (live) {
    const rows = Array.isArray(live) ? live : live.content ?? [];
    const total = Array.isArray(live) ? rows.length : live.totalElements ?? rows.length;
    const totalPages = Array.isArray(live) ? 1 : live.totalPages ?? 1;
    return { rows, total, totalPages, source: "live" };
  }
  return { ...listOrdersMock(params), source: "mock" };
}

export async function getOrder(id: string): Promise<{ order: OrderRecord | undefined; source: Source }> {
  const live = await tryLive<OrderRecord>("orders", `/api/v1/admin/orders/${encodeURIComponent(id)}`);
  if (live) return { order: live, source: "live" };
  return { order: getOrderMock(id), source: "mock" };
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<{ order: OrderRecord | undefined; source: Source }> {
  if (isAlive("orders")) {
    try {
      const res = await adminFetch(`/api/v1/admin/orders/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        return { order: (await res.json()) as OrderRecord, source: "live" };
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) throw err;
    }
  }
  return { order: updateOrderStatusMock(id, status), source: "mock" };
}

// ---------- Payments ----------

export interface ListPaymentsParams {
  status?: string;
  gateway?: string;
  q?: string;
  page?: number;
  size?: number;
}

export interface ListPaymentsResult {
  rows: PaymentRecord[];
  total: number;
  totalPages: number;
  source: Source;
}

export async function listPayments(params: ListPaymentsParams = {}): Promise<ListPaymentsResult> {
  const live = await tryLive<{ content?: PaymentRecord[]; totalElements?: number; totalPages?: number } | PaymentRecord[]>(
    "payments",
    `/api/v1/admin/payments${qs(params as Record<string, unknown>)}`,
  );
  if (live) {
    const rows = Array.isArray(live) ? live : live.content ?? [];
    const total = Array.isArray(live) ? rows.length : live.totalElements ?? rows.length;
    const totalPages = Array.isArray(live) ? 1 : live.totalPages ?? 1;
    return { rows, total, totalPages, source: "live" };
  }
  return { ...listPaymentsMock(params), source: "mock" };
}

// ---------- Dashboard ----------

export interface DashboardResult extends DashboardStats {
  source: Source;
}

export async function getDashboardStats(): Promise<DashboardResult> {
  const live = await tryLive<DashboardStats>("dashboard", "/api/v1/admin/dashboard/stats");
  if (live) return { ...live, source: "live" };
  return { ...dashboardStatsMock(), source: "mock" };
}

// ---------- Customers ----------

import {
  listCustomersMock,
  getCustomerMock,
  type CustomerRecord,
} from "@/services/commerceMock";

export interface ListCustomersParams {
  q?: string;
  status?: string;
  segment?: string;
  page?: number;
  size?: number;
}

export interface ListCustomersResult {
  rows: CustomerRecord[];
  total: number;
  totalPages: number;
  source: Source;
}

export async function listCustomers(params: ListCustomersParams = {}): Promise<ListCustomersResult> {
  const live = await tryLive<{ content?: CustomerRecord[]; totalElements?: number; totalPages?: number } | CustomerRecord[]>(
    "customers",
    `/api/v1/admin/customers${qs(params as Record<string, unknown>)}`,
  );
  if (live) {
    const rows = Array.isArray(live) ? live : live.content ?? [];
    const total = Array.isArray(live) ? rows.length : live.totalElements ?? rows.length;
    const totalPages = Array.isArray(live) ? 1 : live.totalPages ?? 1;
    return { rows, total, totalPages, source: "live" };
  }
  return { ...listCustomersMock(params), source: "mock" };
}

export async function getCustomer(id: string): Promise<{ customer: CustomerRecord | undefined; orders: OrderRecord[]; source: Source }> {
  const live = await tryLive<{ customer: CustomerRecord; orders: OrderRecord[] }>(
    "customers",
    `/api/v1/admin/customers/${encodeURIComponent(id)}`,
  );
  if (live) return { customer: live.customer, orders: live.orders ?? [], source: "live" };
  const mock = getCustomerMock(id);
  return { ...mock, source: "mock" };
}
