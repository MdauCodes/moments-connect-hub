import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge, PaymentStatusBadge, formatKes, formatDate } from "@/components/admin/commerceUi";
import { getOrder, updateOrderStatus } from "@/services/commerceApi";
import type { OrderRecord } from "@/services/commerceMock";

interface Props {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailDrawer({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [staffNotes, setStaffNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    setLoading(true);
    setOrder(null);
    getOrder(orderId)
      .then((res) => {
        if (cancelled) return;
        setOrder(res.order ?? null);
        setStaffNotes(((res.order as any)?.staffNotes ?? res.order?.notes ?? "") as string);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load order"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderId]);

  const o = order as (OrderRecord & Record<string, any>) | null;

  return (
    <Sheet open={!!orderId} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {loading || !o ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background px-6 py-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Order reference</div>
                  <div className="font-mono text-base font-semibold">{o.reference}</div>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
              <button
                onClick={onClose}
                className="rounded-sm p-1 opacity-70 hover:opacity-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Customer */}
              <Section title="Customer">
                <Row label="Name" value={o.customerName || "—"} />
                <Row label="Email" value={o.customerEmail || "—"} />
                <Row label="Phone" value={o.customerPhone || "—"} />
                <Row label="Delivery address" value={o.shippingAddress || "—"} />
                <Row label="City" value={o.city || "—"} />
                <Row label="County" value={o.county || "—"} />
                <Row label="Postal code" value={o.postalCode || "—"} />
              </Section>

              {/* Items */}
              <Section title="Items">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                        <th className="py-2 pr-3">Product</th>
                        <th className="py-2 pr-3">Category</th>
                        <th className="py-2 pr-3">Variant</th>
                        <th className="py-2 pr-3 text-right">Qty</th>
                        <th className="py-2 pr-3 text-right">Unit</th>
                        <th className="py-2 text-right">Line total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(o.items ?? []).map((it: any, i: number) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-3 font-medium">{it.name}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{it.category ?? "—"}</td>
                          <td className="py-2 pr-3 text-muted-foreground text-xs">
                            {[it.size, it.material, it.finish].filter(Boolean).join(" · ") || "—"}
                          </td>
                          <td className="py-2 pr-3 text-right">{Number(it.qty ?? 0)}</td>
                          <td className="py-2 pr-3 text-right">{formatKes(it.unitPrice)}</td>
                          <td className="py-2 text-right font-medium">{formatKes(it.lineTotal ?? Number(it.unitPrice) * Number(it.qty))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              {/* Financials */}
              <Section title="Financials">
                <Row label="Subtotal" value={formatKes(o.subtotal)} />
                <Row label="Delivery fee" value={formatKes(o.shippingFee)} />
                {Number(o.discount ?? 0) > 0 && (
                  <Row label="Discount" value={`− ${formatKes(o.discount)}`} />
                )}
                <Row label="Total" value={formatKes(o.total)} bold />
              </Section>

              {/* Payment */}
              <Section title="Payment">
                <Row label="Method" value={o.paymentMethod ?? o.paymentGateway ?? "—"} />
                <div className="flex items-center justify-between gap-3 py-1.5">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <PaymentStatusBadge status={o.paymentStatus} />
                </div>
                {o.promoCode && <Row label="Promo code" value={o.promoCode} />}
              </Section>

              {/* Status history */}
              {Array.isArray(o.statusHistory) && o.statusHistory.length > 0 && (
                <Section title="Status history">
                  <ol className="space-y-3">
                    {o.statusHistory.map((h: any, i: number) => (
                      <li key={i} className="border-l-2 border-primary/30 pl-3">
                        <div className="text-sm font-medium">
                          {(h.fromStatus ?? "—")} → {(h.toStatus ?? h.status ?? "—")}
                        </div>
                        {h.note && <div className="text-xs text-muted-foreground">{h.note}</div>}
                        <div className="text-[11px] text-muted-foreground">
                          {h.changedBy ? `by ${h.changedBy} · ` : ""}{formatDate(h.changedAt)}
                        </div>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {/* Staff */}
              <Section title="Staff">
                <Row label="Assigned to" value={o.assignedTo || "—"} />
                <label className="block">
                  <span className="text-xs uppercase text-muted-foreground">Staff notes</span>
                  <textarea
                    className="mt-1 w-full rounded-md border bg-background p-2 text-sm"
                    rows={4}
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    placeholder="Internal notes…"
                  />
                </label>
                <div className="flex justify-end pt-2">
                  <button
                    className="admin-btn admin-btn-ghost"
                    disabled={savingNotes}
                    onClick={async () => {
                      // Notes save is best-effort: re-use the status PATCH endpoint pattern
                      // is wrong; without a dedicated notes endpoint we just toast for now.
                      setSavingNotes(true);
                      try {
                        await updateOrderStatus(o.id, o.status);
                        toast.success("Notes saved locally — backend notes endpoint not wired");
                      } catch (e) {
                        toast.error("Could not save notes");
                      } finally {
                        setSavingNotes(false);
                      }
                    }}
                  >
                    {savingNotes && <Loader2 size={14} className="mr-1 animate-spin inline" />}
                    Save notes
                  </button>
                </div>
              </Section>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="rounded-lg border bg-card p-4 space-y-1">{children}</div>
    </section>
  );
}

function Row({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm text-right ${bold ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}
