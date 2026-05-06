// ----------------------------------------------------------------------------
// Admin commerce API client — all calls hit the live backend via adminFetch,
// which attaches the Authorization: Bearer <token> header from AdminAuthContext.
// No mock fallback.
// ----------------------------------------------------------------------------

import { adminFetch, ApiError } from "@/services/adminApi";
import type {
  CustomerRecord,
  DashboardStats,
  OrderRecord,
  OrderStatus,
  PaymentRecord,
} from "@/services/commerceMock";
import type { AnalyticsOverview } from "@/services/analyticsMock";

// "live" kept in result types for backward compatibility with existing UI
// (e.g. <MockBanner source={...} />) — value is always "live" now.
type Source = "live";

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function getJson<T>(path: string): Promise<T> {
  const res = await adminFetch(path);
  if (!res.ok) throw new ApiError({ status: res.status, message: res.statusText });
  return (await res.json()) as T;
}

function unwrapPage<T>(
  data: { content?: T[]; totalElements?: number; totalPages?: number } | T[],
): { rows: T[]; total: number; totalPages: number } {
  if (Array.isArray(data)) return { rows: data, total: data.length, totalPages: 1 };
  const rows = data.content ?? [];
  return { rows, total: data.totalElements ?? rows.length, totalPages: data.totalPages ?? 1 };
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
  const data = await getJson<{ content?: OrderRecord[]; totalElements?: number; totalPages?: number } | OrderRecord[]>(
    `/api/v1/admin/orders${qs(params as Record<string, unknown>)}`,
  );
  return { ...unwrapPage(data), source: "live" };
}

export async function getOrder(id: string): Promise<{ order: OrderRecord | undefined; source: Source }> {
  const order = await getJson<OrderRecord>(`/api/v1/admin/orders/${encodeURIComponent(id)}`);
  return { order, source: "live" };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<{ order: OrderRecord | undefined; source: Source }> {
  const res = await adminFetch(`/api/v1/admin/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new ApiError({ status: res.status, message: res.statusText });
  const order = (await res.json()) as OrderRecord;
  return { order, source: "live" };
}

export async function assignOrder(
  id: string,
  assigneeId: string,
): Promise<{ order: OrderRecord | undefined; source: Source }> {
  const res = await adminFetch(`/api/v1/admin/orders/${encodeURIComponent(id)}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assigneeId }),
  });
  if (!res.ok) throw new ApiError({ status: res.status, message: res.statusText });
  const order = (await res.json()) as OrderRecord;
  return { order, source: "live" };
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
  const data = await getJson<{ content?: PaymentRecord[]; totalElements?: number; totalPages?: number } | PaymentRecord[]>(
    `/api/v1/admin/payments${qs(params as Record<string, unknown>)}`,
  );
  return { ...unwrapPage(data), source: "live" };
}

// ---------- Dashboard ----------

export interface DashboardResult extends DashboardStats {
  source: Source;
}

export async function getDashboardStats(): Promise<DashboardResult> {
  const stats = await getJson<DashboardStats>("/api/v1/admin/dashboard/stats");
  return { ...stats, source: "live" };
}

// ---------- Customers ----------

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
  const data = await getJson<{ content?: CustomerRecord[]; totalElements?: number; totalPages?: number } | CustomerRecord[]>(
    `/api/v1/admin/customers${qs(params as Record<string, unknown>)}`,
  );
  return { ...unwrapPage(data), source: "live" };
}

export async function getCustomer(
  id: string,
): Promise<{ customer: CustomerRecord | undefined; orders: OrderRecord[]; source: Source }> {
  const data = await getJson<{ customer: CustomerRecord; orders?: OrderRecord[] }>(
    `/api/v1/admin/customers/${encodeURIComponent(id)}`,
  );
  return { customer: data.customer, orders: data.orders ?? [], source: "live" };
}

// ---------- Analytics ----------

export interface AnalyticsResult extends AnalyticsOverview {
  source: Source;
}

export async function getAnalyticsOverview(days = 30): Promise<AnalyticsResult> {
  const data = await getJson<AnalyticsOverview>(`/api/v1/admin/analytics/overview?days=${days}`);
  return { ...data, source: "live" };
}

// ---------- Exports ----------

export async function exportOrders(params: ListOrdersParams = {}): Promise<{ rows: OrderRecord[]; source: Source }> {
  const res = await listOrders({ ...params, size: 1000 });
  return { rows: res.rows, source: res.source };
}

export async function exportPayments(params: ListPaymentsParams = {}): Promise<{ rows: PaymentRecord[]; source: Source }> {
  const res = await listPayments({ ...params, size: 1000 });
  return { rows: res.rows, source: res.source };
}

export async function exportCustomers(params: ListCustomersParams = {}): Promise<{ rows: CustomerRecord[]; source: Source }> {
  const res = await listCustomers({ ...params, size: 1000 });
  return { rows: res.rows, source: res.source };
}
