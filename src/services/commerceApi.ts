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
  PaymentGateway,
  PaymentRecord,
} from "@/services/commerceMock";
import type { AnalyticsOverview } from "@/services/analyticsMock";

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

function unwrapPage<T>(data: { content?: T[]; totalElements?: number; totalPages?: number } | T[]): {
  rows: T[];
  total: number;
  totalPages: number;
} {
  if (Array.isArray(data)) return { rows: data, total: data.length, totalPages: 1 };
  const rows = data.content ?? [];
  return { rows, total: data.totalElements ?? rows.length, totalPages: data.totalPages ?? 1 };
}

const num = (v: unknown): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

// Map backend PaymentMethod → frontend PaymentGateway type.
// Backend: PAYHERO | MPESA | BANK_TRANSFER | CASH_ON_DELIVERY
// Frontend type now matches backend exactly.
function normalizeGateway(raw: string | undefined): PaymentGateway {
  if (!raw) return "MPESA";
  const upper = raw.toUpperCase();
  if (upper === "PAYHERO") return "PAYHERO";
  if (upper === "MPESA" || upper === "M_PESA") return "MPESA";
  if (upper === "BANK_TRANSFER" || upper === "BANK") return "BANK_TRANSFER";
  if (upper === "CASH_ON_DELIVERY" || upper === "COD") return "CASH_ON_DELIVERY";
  return "MPESA";
}

// Normalise backend OrderDto → frontend OrderRecord.
// Backend serialises BigDecimal as number-or-string; coerce every monetary
// field to a real number here so downstream UI never gets NaN.
function normalizeOrder(raw: any): OrderRecord {
  const items = (raw?.items ?? []).map((it: any) => ({
    productId: it.productId ?? it.id ?? "",
    name: it.productName ?? it.name ?? "",
    qty: num(it.quantity ?? it.qty),
    unitPrice: num(it.unitPrice),
    imageUrl: it.primaryImageUrl ?? it.imageUrl,
    category: it.category,
    size: it.size,
    material: it.material,
    finish: it.finish,
    lineTotal: num(it.lineTotal ?? num(it.unitPrice) * num(it.quantity ?? it.qty)),
  }));

  const subtotal = num(raw?.subtotal);
  const shippingFee = num(raw?.deliveryFee ?? raw?.shippingFee);
  const total = num(raw?.totalAmount ?? raw?.total);

  return {
    id: raw?.id ?? raw?.reference ?? "",
    reference: raw?.reference ?? raw?.id ?? "",

    // Backend field: status (OrderStatus enum) — pass through directly.
    // If the value arrives in an unexpected shape, default to PENDING_PAYMENT.
    status: (raw?.status as OrderStatus) ?? "PENDING_PAYMENT",

    // Backend field: paymentStatus (PaymentStatus enum).
    // Backend values: PENDING | PAID | FAILED | REFUNDED
    paymentStatus: raw?.paymentStatus ?? "PENDING",

    // Backend field: paymentMethod (PaymentMethod enum).
    // Normalised → PaymentGateway type used by the UI.
    paymentGateway: normalizeGateway(raw?.paymentMethod ?? raw?.paymentGateway),

    customerName: raw?.contactName ?? raw?.customerName ?? "",
    customerEmail: raw?.email ?? raw?.customerEmail ?? raw?.maskedEmail ?? "",
    customerPhone: raw?.phone ?? raw?.customerPhone ?? "",
    shippingAddress: raw?.deliveryAddress ?? raw?.shippingAddress ?? "",
    city: raw?.city ?? "",
    county: raw?.county,
    postalCode: raw?.postalCode,

    items,
    subtotal: subtotal || items.reduce((s: number, it: any) => s + (it.lineTotal ?? 0), 0),
    shippingFee,
    discount: num(raw?.discount),
    total: total || subtotal + shippingFee,
    currency: "KES",

    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? raw?.createdAt ?? new Date().toISOString(),

    trackingNumber: raw?.trackingNumber,
    notes: raw?.notes,
    staffNotes: raw?.staffNotes ?? "",
    assignedTo: raw?.assignedTo,
    assignedToId: raw?.assignedToId,
    contentsVerified: raw?.contentsVerified ?? false,
    deliveryConfirmationStatus: raw?.deliveryConfirmationStatus,
    vatAmount: num(raw?.vatAmount),
    taxableAmount: num(raw?.taxableAmount),
    vatRate: raw?.vatRate != null ? Number(raw.vatRate) : undefined,
    promoCode: raw?.promoCode,
    paymentMethod: raw?.paymentMethod,
    fulfillmentType: raw?.fulfillmentType,
    courierType: raw?.courierType,
    courierServiceName: raw?.courierServiceName,
    courierStageOrOffice: raw?.courierStageOrOffice,
    statusHistory: (raw?.statusHistory ?? []).map((h: any) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      note: h.note,
      changedBy: h.changedBy,
      changedAt: h.changedAt,
    })),
  } as OrderRecord;
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
  // Backend filter param is "status" with OrderStatus enum value — pass through directly.
  const data = await getJson<{ content?: any[]; totalElements?: number; totalPages?: number } | any[]>(
    `/api/v1/admin/orders${qs(params as Record<string, unknown>)}`,
  );
  const { rows, total, totalPages } = unwrapPage<any>(data);
  return { rows: rows.map(normalizeOrder), total, totalPages, source: "live" };
}

export async function getOrder(id: string): Promise<{ order: OrderRecord | undefined; source: Source }> {
  const raw = await getJson<any>(`/api/v1/admin/orders/${encodeURIComponent(id)}`);
  return { order: normalizeOrder(raw), source: "live" };
}

// Backend PATCH /api/v1/admin/orders/{id}/status
// Body: { status: OrderStatus, staffNotes?: string }
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  staffNotes?: string,
): Promise<{ order: OrderRecord | undefined; source: Source }> {
  const res = await adminFetch(`/api/v1/admin/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, staffNotes }),
  });
  if (!res.ok) throw new ApiError({ status: res.status, message: res.statusText });
  const raw = await res.json();
  return { order: normalizeOrder(raw), source: "live" };
}

// Backend PATCH /api/v1/admin/orders/{id}/assign
// Body: { assignedTo: string }  ← backend field name is assignedTo, not assigneeId
export async function assignOrder(
  id: string,
  assignedTo: string,
  assignedToId?: string,
): Promise<{ order: OrderRecord | undefined; source: Source }> {
  const res = await adminFetch(`/api/v1/admin/orders/${encodeURIComponent(id)}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedTo, assignedToId }),
  });
  if (!res.ok) throw new ApiError({ status: res.status, message: res.statusText });
  const raw = await res.json();
  return { order: normalizeOrder(raw), source: "live" };
}

// PATCH /api/v1/admin/orders/{id}/dispatch-confirm
export type DeliveryConfirmation =
  | "CUSTOMER_PAYS_COURIER"
  | "CUSTOMER_PAYS_BUSINESS"
  | "REVERTED_TO_PICKUP"
  | "CONFIRM_LATER";

export async function dispatchConfirmOrder(
  id: string,
  deliveryConfirmationStatus: DeliveryConfirmation,
  contentsVerified = true,
): Promise<{ order: OrderRecord | undefined; source: Source }> {
  const res = await adminFetch(`/api/v1/admin/orders/${encodeURIComponent(id)}/dispatch-confirm`, {
    method: "PATCH",
    body: JSON.stringify({ deliveryConfirmationStatus, contentsVerified }),
  });
  if (!res.ok) throw new ApiError({ status: res.status, message: res.statusText });
  const raw = await res.json();
  return { order: normalizeOrder(raw), source: "live" };
}

// GET /api/v1/admin/users/assignable — only enabled staff, no customers.
export interface AssignableUser {
  id: string;
  name: string;
  email: string;
  staffRole?: string;
  staffRoleDisplay?: string;
}
export async function listAssignableUsers(): Promise<AssignableUser[]> {
  try {
    const raw = await getJson<any>("/api/v1/admin/users/assignable");
    const rows: any[] = Array.isArray(raw) ? raw : (raw?.content ?? []);
    return rows.map((u) => ({
      id: String(u.id ?? ""),
      name: u.name ?? [u.firstName, u.lastName].filter(Boolean).join(" ") ?? u.email ?? "Unnamed",
      email: u.email ?? "",
      staffRole: u.staffRole,
      staffRoleDisplay: u.staffRoleDisplay,
    }));
  } catch {
    return [];
  }
}

// Backend PATCH /api/v1/admin/orders/{id}/refund  (@IsAdmin only)
// Body: { reason: string }
export async function refundOrder(
  id: string,
  reason: string,
): Promise<{ order: OrderRecord | undefined; source: Source }> {
  const res = await adminFetch(`/api/v1/admin/orders/${encodeURIComponent(id)}/refund`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new ApiError({ status: res.status, message: res.statusText });
  const raw = await res.json();
  return { order: normalizeOrder(raw), source: "live" };
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
  const data = await getJson<
    { content?: PaymentRecord[]; totalElements?: number; totalPages?: number } | PaymentRecord[]
  >(`/api/v1/admin/payments${qs(params as Record<string, unknown>)}`);
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
  const data = await getJson<
    { content?: CustomerRecord[]; totalElements?: number; totalPages?: number } | CustomerRecord[]
  >(`/api/v1/admin/customers${qs(params as Record<string, unknown>)}`);
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

export async function exportPayments(
  params: ListPaymentsParams = {},
): Promise<{ rows: PaymentRecord[]; source: Source }> {
  const res = await listPayments({ ...params, size: 1000 });
  return { rows: res.rows, source: res.source };
}

export async function exportCustomers(
  params: ListCustomersParams = {},
): Promise<{ rows: CustomerRecord[]; source: Source }> {
  const res = await listCustomers({ ...params, size: 1000 });
  return { rows: res.rows, source: res.source };
}
