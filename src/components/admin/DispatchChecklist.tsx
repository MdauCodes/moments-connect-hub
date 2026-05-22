import { useEffect, useMemo, useState } from "react";
import { Loader2, X, Printer } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { updateOrderStatus } from "@/services/commerceApi";
import type { OrderRecord } from "@/services/commerceMock";
import { downloadDispatchChecklistPdf } from "@/lib/pdf";

interface Props {
  order: OrderRecord | null;
  onClose: () => void;
  onDispatched: (orderId: string) => void | Promise<void>;
}

const STORAGE_PREFIX = "dispatch_checklist_";

function itemKey(orderId: string, idx: number, productId: string): string {
  return `${orderId}:${productId || idx}`;
}

export function DispatchChecklist({ order, onClose, onDispatched }: Props) {
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const orderId = order?.id ?? null;
  useEffect(() => {
    if (!orderId) {
      setTicked(new Set());
      setConfirmOpen(false);
      return;
    }
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${orderId}`);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      setTicked(new Set(arr));
    } catch {
      setTicked(new Set());
    }
  }, [orderId]);

  const itemIds = useMemo(
    () => (order?.items ?? []).map((it, idx) => itemKey(orderId ?? "", idx, it.productId)),
    [orderId, order?.items],
  );
  void itemIds;

  const toggle = (id: string) => {
    if (!order) return;
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(`${STORAGE_PREFIX}${order.id}`, JSON.stringify(Array.from(next)));
      } catch { /* ignore */ }
      return next;
    });
  };

  const dispatchNow = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      await updateOrderStatus(order.id, "DISPATCHED");
      try { window.localStorage.removeItem(`${STORAGE_PREFIX}${order.id}`); } catch { /* ignore */ }
      toast.success("Order dispatched successfully");
      setConfirmOpen(false);
      await onDispatched(order.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Dispatch failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sheet open={!!order} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {order && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--admin-muted)" }}>
                  Dispatch checklist
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "4px 0 2px" }}>
                  {order.reference}
                </h2>
                <div style={{ fontSize: 13, color: "var(--admin-muted)" }}>{order.customerName}</div>
              </div>

              <div style={{ borderTop: "1px solid var(--admin-border)" }} />

              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {order.items.map((it, idx) => {
                  const id = itemKey(order.id, idx, it.productId);
                  const checked = ticked.has(id);
                  return (
                    <li key={id}>
                      <label style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: 12,
                        border: "1px solid var(--admin-border)",
                        borderRadius: 10,
                        background: checked ? "var(--admin-surface-2, #f6f3ee)" : "var(--admin-surface, #fff)",
                        cursor: "pointer",
                      }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(id)}
                          style={{ marginTop: 3 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                          <div style={{ fontSize: 12, marginTop: 2 }}>
                            Qty: <b>{it.qty}</b>
                          </div>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>

              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  className="admin-btn admin-btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setConfirmOpen(true)}
                >
                  Dispatch Order
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => downloadDispatchChecklistPdf(order)}
                >
                  <Printer size={14} style={{ marginRight: 6 }} />
                  Download printable checklist (PDF)
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {confirmOpen && order && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "grid", placeItems: "center", zIndex: 100, padding: 16,
          }}
        >
          <div style={{
            background: "var(--admin-surface, #fff)", borderRadius: 14, width: "100%",
            maxWidth: 420, padding: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: 18 }}>
                Confirm dispatch
              </h3>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: "var(--admin-text)", marginTop: 12, lineHeight: 1.5 }}>
              Dispatch <b>{order.reference}</b> to <b>{order.customerName}</b>?
            </p>

            <div style={{ display: "flex", gap: 8, marginTop: 22, justifyContent: "flex-end" }}>
              <button className="admin-btn admin-btn-ghost" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-primary" onClick={() => void dispatchNow()} disabled={submitting}>
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
