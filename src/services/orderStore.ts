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

export const orderStore = {
  /** Place an order. Always persists to local store too so the user has
   *  something to come back to even if the backend later forgets it. */
  async placeOrder(input: PlaceOrderInput): Promise<{ order: CustomerOrder; source: "live" | "mock" }> {
    let live: CustomerOrder | null = null;
    try {
      const res = await apiFetch("/api/v1/checkout", {
        method: "POST",
        session: true,
        auth: true,
        json: {
          items: input.items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            size: it.size,
            material: it.material,
            finish: it.finish,
          })),
          customer: input.customer,
          shippingFee: input.shippingFee,
          paymentMethod: input.paymentMethod,
        },
      });
      if (res.ok) live = (await res.json()) as CustomerOrder;
    } catch { /* fall back to local */ }

    const order = live ?? buildOrderFromInput(input);
    const all = readAll();
    if (!all.some((o) => o.reference === order.reference)) {
      writeAll([order, ...all]);
    }
    return { order, source: live ? "live" : "mock" };
  },

  /** Trigger an STK push. In mock mode, schedules a status flip. */
  async startMpesaStk(reference: string, phone: string): Promise<{ success: boolean; source: "live" | "mock" }> {
    const live = await tryLiveJson<{ success: boolean }>(`/api/v1/public/payments/mpesa/stk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderReference: reference, phone }),
    });
    if (live) return { success: !!live.success, source: "live" };

    // Mock: ~85% success after a 6-12s delay
    const all = readAll();
    const idx = all.findIndex((o) => o.reference === reference);
    if (idx >= 0) {
      const willSucceed = Math.random() > 0.15;
      const delay = 5000 + Math.floor(Math.random() * 7000);
      setTimeout(() => {
        const fresh = readAll();
        const i = fresh.findIndex((o) => o.reference === reference);
        if (i < 0) return;
        const o = fresh[i];
        if (willSucceed) {
          o.paymentStatus = "SUCCESS";
          o.status = "PAID";
          o.paymentReference = genPaymentRef();
          o.updatedAt = nowIso();
          o.trackingEvents = [
            ...(o.trackingEvents ?? []),
            { at: o.updatedAt, label: "Payment confirmed", description: `M-Pesa ${o.paymentReference}` },
          ];
        } else {
          o.paymentStatus = "FAILED";
          o.status = "PAYMENT_FAILED";
          o.failureReason = ["User cancelled STK push", "Insufficient funds", "Timeout waiting for PIN"][Math.floor(Math.random() * 3)];
          o.updatedAt = nowIso();
          o.trackingEvents = [
            ...(o.trackingEvents ?? []),
            { at: o.updatedAt, label: "Payment failed", description: o.failureReason },
          ];
        }
        fresh[i] = o;
        writeAll(fresh);
      }, delay);
    }
    return { success: true, source: "mock" };
  },

  /** Poll status — returns latest snapshot. */
  async getStatus(reference: string): Promise<{ order: CustomerOrder | null; source: "live" | "mock" }> {
    const live = await tryLiveJson<CustomerOrder>(`/api/v1/public/orders/${encodeURIComponent(reference)}`);
    if (live) {
      // Cache locally so /account/orders shows it.
      const all = readAll();
      const idx = all.findIndex((o) => o.reference === live.reference);
      if (idx >= 0) all[idx] = live; else all.unshift(live);
      writeAll(all);
      return { order: live, source: "live" };
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
    const live = await tryLiveJson<CustomerOrder>(`/api/v1/orders/track/${encodeURIComponent(reference)}`);
    if (live) return { order: live, source: "live" };
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
  async getPaymentStatus(orderId: string): Promise<{ status: "PENDING" | "SUCCESS" | "FAILED" | "UNKNOWN"; message?: string; reference?: string }> {
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
      return { status, message: data.message, reference: data.reference ?? data.orderReference };
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
