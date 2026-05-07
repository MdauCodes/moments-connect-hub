// ----------------------------------------------------------------------------
// Shared UI helpers for the e-commerce admin (orders / payments / dashboard).
// Pure presentation — no business logic.
// ----------------------------------------------------------------------------
import type { OrderStatus, PaymentStatus, PaymentGateway } from "@/services/commerceMock";

export function formatKes(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return `KES ${safe.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

export function formatDateShort(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short" });
}

const ORDER_TONE: Record<OrderStatus, { bg: string; fg: string; label: string }> = {
  PENDING:    { bg: "rgba(234, 179, 8, 0.15)",  fg: "#a16207", label: "Pending" },
  PAID:       { bg: "rgba(34, 197, 94, 0.15)",  fg: "#15803d", label: "Paid" },
  PROCESSING: { bg: "rgba(59, 130, 246, 0.15)", fg: "#1d4ed8", label: "Processing" },
  PACKED:     { bg: "rgba(99, 102, 241, 0.15)", fg: "#4338ca", label: "Packed" },
  SHIPPED:    { bg: "rgba(168, 85, 247, 0.15)", fg: "#7e22ce", label: "Shipped" },
  DELIVERED:  { bg: "rgba(20, 184, 166, 0.18)", fg: "#0f766e", label: "Delivered" },
  CANCELLED:  { bg: "rgba(107, 114, 128, 0.18)",fg: "#374151", label: "Cancelled" },
  REFUNDED:   { bg: "rgba(244, 63, 94, 0.15)",  fg: "#be123c", label: "Refunded" },
  ON_HOLD:    { bg: "rgba(245, 158, 11, 0.15)", fg: "#b45309", label: "On hold" },
};

const PAYMENT_TONE: Record<PaymentStatus, { bg: string; fg: string; label: string }> = {
  SUCCESS:  { bg: "rgba(34, 197, 94, 0.15)", fg: "#15803d", label: "Success" },
  FAILED:   { bg: "rgba(239, 68, 68, 0.15)", fg: "#b91c1c", label: "Failed" },
  PENDING:  { bg: "rgba(234, 179, 8, 0.15)", fg: "#a16207", label: "Pending" },
  REFUNDED: { bg: "rgba(244, 63, 94, 0.15)", fg: "#be123c", label: "Refunded" },
};

const GATEWAY_LABEL: Record<PaymentGateway, string> = {
  MPESA: "M-Pesa",
  CARD: "Card",
  BANK: "Bank",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const tone = ORDER_TONE[status] ?? ORDER_TONE.PENDING;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 9px",
      borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: tone.bg, color: tone.fg, lineHeight: 1.4,
    }}>{tone.label}</span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const tone = PAYMENT_TONE[status] ?? PAYMENT_TONE.PENDING;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 9px",
      borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: tone.bg, color: tone.fg, lineHeight: 1.4,
    }}>{tone.label}</span>
  );
}

export function GatewayChip({ gateway }: { gateway: PaymentGateway }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 7px",
      borderRadius: 6, fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
      background: "var(--admin-surface-2)", color: "var(--admin-text)",
      border: "1px solid var(--admin-border)",
    }}>{GATEWAY_LABEL[gateway]}</span>
  );
}

export function MockBanner({ source }: { source: "live" | "mock" }) {
  if (source === "live") return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
      borderRadius: 8, background: "rgba(234, 179, 8, 0.12)",
      border: "1px solid rgba(234, 179, 8, 0.3)", color: "#92400e",
      fontSize: 12, marginBottom: 14,
    }}>
      <span style={{ fontWeight: 600 }}>Demo data</span>
      <span style={{ opacity: 0.85 }}>
        Showing illustrative figures. Live data will appear once the backend endpoint is reachable.
      </span>
    </div>
  );
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PACKED", label: "Packed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "ON_HOLD", label: "On hold" },
];

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "PENDING", label: "Pending" },
  { value: "REFUNDED", label: "Refunded" },
];

export const GATEWAY_OPTIONS: { value: PaymentGateway | "ALL"; label: string }[] = [
  { value: "ALL", label: "All gateways" },
  { value: "MPESA", label: "M-Pesa" },
  { value: "CARD", label: "Card" },
  { value: "BANK", label: "Bank transfer" },
];
