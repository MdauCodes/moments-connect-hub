// ----------------------------------------------------------------------------
// Storefront order store — mock-live hybrid.
//
// Tries the public Spring Boot endpoints first; falls back to a deterministic
// localStorage-backed mock so the entire checkout → processing → success →
// account/orders loop works even with no backend.
//
// Live endpoints assumed (backend will provide):
//   POST   /api/v1/public/orders                -> create order (returns reference)
//   POST   /api/v1/public/payments/mpesa/stk    -> trigger STK push
//   GET    /api/v1/public/payments/{ref}/status -> poll payment status
//   GET    /api/v1/public/orders/{ref}?email=   -> guest lookup
//   GET    /api/v1/customer/orders              -> authed customer order list
//   GET    /api/v1/customer/orders/{ref}        -> authed customer order detail
// ----------------------------------------------------------------------------

import { apiUrl, apiFetch } from "@/config/api";
import { authFetch, getAccessToken } from "@/contexts/AuthContext";
import type { CartItem } from "@/contexts/CartContext";

export type CustomerOrderStatus =
  | "AWAITING_PAYMENT" | "PAID" | "PROCESSING" | "PACKED"
  | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" | "PAYMENT_FAILED";

export type CustomerPaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface CustomerOrderItem {
  productId: string;
  productName: string;
  primaryImageUrl: string;
  size: string;
  material: string;
  finish: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variantLabel?: string;
  sku?: string;
  isBackorder?: boolean;
}

export type CheckoutPaymentMethod = "PAYHERO" | "CASH_ON_DELIVERY" | "BANK_TRANSFER" | "MPESA" | "CARD" | "BANK";

export interface CustomerOrder {
  id?: string;
  reference: string;
  status: CustomerOrderStatus;
  paymentStatus: CustomerPaymentStatus;
  paymentMethod: CheckoutPaymentMethod;
  paymentReference?: string;
  failureReason?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  items: CustomerOrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: "KES";
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  receiptNumber?: string;
  trackingEvents?: { at: string; label: string; description?: string }[];
}

export interface PlaceOrderInput {
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    county: string;
    postalCode?: string;
    notes?: string;
  };
  shippingFee: number;
  paymentMethod: CheckoutPaymentMethod;
  promoCode?: string;
  sessionId?: string;
}

const STORAGE_KEY = "mpk_customer_orders_v1";

function isBrowser() { return typeof window !== "undefined"; }

function readAll(): CustomerOrder[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomerOrder[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: CustomerOrder[]) {
  if (!isBrowser()) return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch { /* ignore */ }
}

function genRef(): string {
  const n = Math.floor(Math.random() * 90000 + 10000);
  return `MP-${n}`;
}

function genPaymentRef(): string {
  return `Q${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
}

function nowIso() { return new Date().toISOString(); }

function buildOrderFromInput(input: PlaceOrderInput): CustomerOrder {
  const subtotal = input.items.reduce((s, it) => s + it.lineTotal, 0);
  const total = subtotal + input.shippingFee;
  const ref = genRef();
  const created = nowIso();
  return {
    reference: ref,
    status: "AWAITING_PAYMENT",
    paymentStatus: "PENDING",
    paymentMethod: input.paymentMethod,
    customerName: input.customer.name,
    customerEmail: input.customer.email,
    customerPhone: input.customer.phone,
    shippingAddress: input.customer.address,
    city: input.customer.city,
    notes: input.customer.notes,
    items: input.items.map((it) => ({
      productId: it.productId,
      productName: it.productName,
      primaryImageUrl: it.primaryImageUrl,
      size: it.size,
      material: it.material,
      finish: it.finish,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      lineTotal: it.lineTotal,
      variantLabel: it.variantLabel,
      sku: it.sku,
      isBackorder: it.isBackorder,
    })),
    subtotal,
    shippingFee: input.shippingFee,
    total,
    currency: "KES",
    createdAt: created,
    updatedAt: created,
    trackingEvents: [{ at: created, label: "Order placed", description: "Awaiting payment confirmation" }],
  };
}

async function tryLiveJson<T>(input: string, init?: RequestInit, authed = false): Promise<T | null> {
  try {
    const res = authed
      ? await authFetch(apiUrl(input), init)
      : await fetch(apiUrl(input), init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function normalizeTrackingDto(raw: Record<string, any>): CustomerOrder {
  return {
    id: raw.id,
    reference: raw.reference,
    status: raw.status,
    paymentStatus: raw.paymentStatus ?? "PENDING",
    paymentMethod: raw.paymentMethod ?? "MPESA",
    customerName: raw.contactName ?? raw.customerName ?? "",
    customerEmail: raw.maskedEmail ?? raw.customerEmail ?? "",
    customerPhone: raw.customerPhone ?? "",
    shippingAddress: raw.shippingAddress ?? raw.deliveryAddress ?? "",
    city: raw.city ?? "",
    items: (raw.items ?? []).map((it: any) => ({
      productId: it.productId ?? "",
      productName: it.productName ?? "",
      primaryImageUrl: it.primaryImageUrl ?? "",
      size: it.size ?? "",
      material: it.material ?? "",
      finish: it.finish ?? "",
      quantity: it.quantity ?? 0,
      unitPrice: it.unitPrice ?? 0,
      lineTotal: it.lineTotal ?? 0,
    })),
    subtotal: raw.subtotal ?? raw.totalAmount ?? 0,
    shippingFee: raw.deliveryFee ?? raw.shippingFee ?? 0,
    total: raw.totalAmount ?? raw.total ?? 0,
    currency: "KES",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    trackingEvents: (raw.statusHistory ?? []).map((h: any) => ({
      at: h.changedAt,
      label: (h.status ?? "").replace(/_/g, " "),
      description: h.note ?? undefined,
    })),
  };
}

export const orderStore = {
  /** Place an order. Strict: throws if the backend cannot be reached or
   *  returns a non-2xx response. No mock fallback — the user must not
   *  continue to payment unless the order is actually created server-side. */
  async placeOrder(input: PlaceOrderInput): Promise<{ order: CustomerOrder; source: "live" }> {
    const body: Record<string, unknown> = {
      contactName: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
      deliveryAddress: input.customer.address,
      city: input.customer.city,
      county: input.customer.county,
      paymentMethod: input.paymentMethod,
      items: input.items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        size: it.size,
        material: it.material,
        finish: it.finish,
      })),
      shippingFee: input.shippingFee,
    };
    if (input.customer.postalCode) body.postalCode = input.customer.postalCode;
    if (input.customer.notes) body.notes = input.customer.notes;
    if (input.promoCode) body.promoCode = input.promoCode;
    if (input.sessionId) body.sessionId = input.sessionId;

    let res: Response;
    try {
      res = await apiFetch("/api/v1/checkout", {
        method: "POST",
        session: true,
        auth: true,
        json: body,
      });
    } catch {
      throw new Error("Cannot reach the server. Check your connection and try again.");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({} as { message?: string; error?: string }));
      const msg =
        (err as { message?: string; error?: string }).message ??
        (err as { message?: string; error?: string }).error ??
        (res.status === 422 ? "Some details are invalid. Please review the form and try again." :
         res.status === 401 ? "Please sign in to complete checkout." :
         `Checkout failed (${res.status})`);
      throw new Error(msg);
    }

    const order = (await res.json()) as CustomerOrder;
    const all = readAll();
    if (!all.some((o) => o.reference === order.reference)) {
      writeAll([order, ...all]);
    }
    return { order, source: "live" };
  },

  /** Trigger an STK push via the unified payments/initiate endpoint.
   *  Strict: returns success only when the backend confirms initiation. */
  async startMpesaStk(orderId: string, phone: string): Promise<{ success: boolean; message?: string }> {
    let res: Response;
    try {
      res = await apiFetch("/api/v1/payments/initiate", {
        method: "POST",
        session: true,
        auth: true,
        json: { orderId, paymentMethod: "MPESA", phone },
      });
    } catch {
      return { success: false, message: "Cannot reach the payment service. Check your connection and try again." };
    }
    if (res.ok) return { success: true };
    const err = await res.json().catch(() => ({} as { message?: string; error?: string }));
    const msg =
      (err as { message?: string; error?: string }).message ??
      (err as { message?: string; error?: string }).error ??
      `Payment initiation failed (${res.status})`;
    return { success: false, message: msg };
  },

  /** Poll status — returns latest snapshot. */
  async getStatus(reference: string): Promise<{ order: CustomerOrder | null; source: "live" | "mock" }> {
    const live = await tryLiveJson<Record<string, any>>(`/api/v1/orders/track/${encodeURIComponent(reference)}`);
    if (live) {
      const order = normalizeTrackingDto(live);
      const all = readAll();
      const idx = all.findIndex((o) => o.reference === order.reference);
      if (idx >= 0) all[idx] = order; else all.unshift(order);
      writeAll(all);
      return { order, source: "live" };
    }
    const found = readAll().find((o) => o.reference === reference) ?? null;
    return { order: found, source: "mock" };
  },

  /** Guest lookup — needs reference + email or phone for verification. */
  async lookup(reference: string, contact: string): Promise<{ order: CustomerOrder | null; source: "live" | "mock" }> {
    const live = await tryLiveJson<CustomerOrder>(
      `/api/v1/public/orders/${encodeURIComponent(reference)}?contact=${encodeURIComponent(contact)}`,
    );
    if (live) return { order: live, source: "live" };
    const c = contact.trim().toLowerCase();
    const found = readAll().find((o) =>
      o.reference === reference &&
      (o.customerEmail.toLowerCase() === c || o.customerPhone.replace(/\s+/g, "") === contact.replace(/\s+/g, "")),
    ) ?? null;
    return { order: found, source: "mock" };
  },

  /** Public order tracking by reference (no contact required). */
  async trackByReference(reference: string): Promise<{ order: CustomerOrder | null; source: "live" | "mock" }> {
    const live = await tryLiveJson<Record<string, any>>(`/api/v1/orders/track/${encodeURIComponent(reference)}`);
    if (live) return { order: normalizeTrackingDto(live), source: "live" };
    const found = readAll().find((o) => o.reference === reference) ?? null;
    return { order: found, source: "mock" };
  },

  /** Authed: list current customer's orders (paginated). */
  async listMine(page = 0, size = 20): Promise<{ rows: CustomerOrder[]; total: number; page: number; totalPages: number; source: "live" | "mock" }> {
    if (getAccessToken()) {
      const live = await tryLiveJson<CustomerOrder[] | { content: CustomerOrder[]; totalElements?: number; totalPages?: number; number?: number }>(
        `/api/v1/customer/orders?page=${page}&size=${size}`, undefined, true,
      );
      if (live) {
        const rows = Array.isArray(live) ? live : live.content ?? [];
        const totalElements = Array.isArray(live) ? rows.length : live.totalElements ?? rows.length;
        const totalPages = Array.isArray(live) ? 1 : live.totalPages ?? 1;
        const number = Array.isArray(live) ? page : live.number ?? page;
        return { rows, total: totalElements, page: number, totalPages, source: "live" };
      }
    }
    const all = readAll();
    return { rows: all, total: all.length, page: 0, totalPages: 1, source: "mock" };
  },

  async getMine(reference: string): Promise<{ order: CustomerOrder | null; source: "live" | "mock" }> {
    if (getAccessToken()) {
      const live = await tryLiveJson<CustomerOrder>(`/api/v1/customer/orders/${encodeURIComponent(reference)}`, undefined, true);
      if (live) return { order: live, source: "live" };
    }
    const found = readAll().find((o) => o.reference === reference) ?? null;
    return { order: found, source: "mock" };
  },

  /** Reorder: re-add the items from a past order to the cart on the backend. */
  async reorder(reference: string): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await apiFetch(`/api/v1/customer/orders/${encodeURIComponent(reference)}/reorder`, {
        method: "POST",
        auth: true,
        session: true,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as { message?: string }));
        return { ok: false, message: (err as { message?: string }).message ?? `Reorder failed (${res.status})` };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : "Network error" };
    }
  },

  /** Initiate a PayHero (M-Pesa STK) payment for an order. */
  async initiatePayment(orderId: string, phone: string, paymentMethod: CheckoutPaymentMethod = "PAYHERO") {
    try {
      const res = await apiFetch("/api/v1/payments/initiate", {
        method: "POST",
        session: true,
        auth: true,
        json: { orderId, paymentMethod, phone },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as { message?: string }));
        return { ok: false as const, message: (err as { message?: string }).message ?? `Payment initiation failed (${res.status})` };
      }
      const data = await res.json().catch(() => ({}));
      return { ok: true as const, data };
    } catch (err) {
      return { ok: false as const, message: err instanceof Error ? err.message : "Network error" };
    }
  },

  /** Poll a payment's status by orderId. */
  async getPaymentStatus(orderId: string): Promise<{ status: "PENDING" | "SUCCESS" | "FAILED" | "UNKNOWN"; message?: string; reference?: string; receiptNumber?: string }> {
    try {
      const res = await apiFetch(`/api/v1/payments/status/${encodeURIComponent(orderId)}`, {
        session: true,
        auth: true,
      });
      if (!res.ok) return { status: "UNKNOWN" };
      const data = (await res.json()) as { status?: string; message?: string; reference?: string; orderReference?: string };
      const raw = String(data.status ?? "").toUpperCase();
      const status: "PENDING" | "SUCCESS" | "FAILED" | "UNKNOWN" =
        raw === "SUCCESS" || raw === "PAID" || raw === "COMPLETED" ? "SUCCESS"
        : raw === "FAILED" || raw === "CANCELLED" || raw === "ERROR" ? "FAILED"
        : raw === "PENDING" || raw === "PROCESSING" ? "PENDING"
        : "UNKNOWN";
      const reference = data.reference ?? data.orderReference;
      const receiptNumber = (data as { receiptNumber?: string }).receiptNumber;
      if (status === "SUCCESS" && reference) {
        const all = readAll();
        const idx = all.findIndex((o) => o.reference === reference || o.id === orderId);
        if (idx >= 0) {
          all[idx] = {
            ...all[idx],
            paymentStatus: "SUCCESS",
            paymentReference: receiptNumber ?? all[idx].paymentReference,
            receiptNumber: receiptNumber ?? all[idx].receiptNumber,
            updatedAt: nowIso(),
          };
          writeAll(all);
        }
      }
      return { status, message: data.message, reference, receiptNumber };
    } catch {
      return { status: "UNKNOWN" };
    }
  },
};

export const SHIPPING_THRESHOLD_KES = 5000;
export const SHIPPING_FLAT_KES = 350;
export function computeShippingFee(subtotal: number): number {
  return subtotal >= SHIPPING_THRESHOLD_KES ? 0 : SHIPPING_FLAT_KES;
}
