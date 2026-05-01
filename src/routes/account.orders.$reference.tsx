import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Package, MapPin, Phone, Mail, RotateCcw, ShoppingBag, CheckCircle2, Clock, Truck, AlertCircle, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PrintReceipt } from "@/components/PrintReceipt";
import { orderStore, type CustomerOrder } from "@/services/orderStore";
import { refundStore, refundEligibility, type RefundRequest, type RefundDesiredAction } from "@/services/refundStore";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/account/orders/$reference")({
  head: ({ params }) => ({
    meta: [{ title: `Order ${params.reference} — Moments Packaging` }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <ProtectedRoute>
      <OrderDetailPage />
    </ProtectedRoute>
  ),
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
}

function statusIcon(status: string) {
  if (status === "DELIVERED") return CheckCircle2;
  if (status === "SHIPPED" || status === "PACKED") return Truck;
  if (status === "PAYMENT_FAILED" || status === "CANCELLED") return AlertCircle;
  return Clock;
}

function statusTone(status: string) {
  if (status === "DELIVERED" || status === "PAID") return "bg-accent/15 text-accent";
  if (status === "PAYMENT_FAILED" || status === "CANCELLED") return "bg-destructive/15 text-destructive";
  return "bg-secondary text-foreground";
}

function OrderDetailPage() {
  const { reference } = Route.useParams();
  const { addItem } = useCart();
  const [order, setOrder] = useState<CustomerOrder | null | undefined>(undefined);
  const [refund, setRefund] = useState<RefundRequest | null>(null);
  const [showRefundForm, setShowRefundForm] = useState(false);

  useEffect(() => {
    orderStore.getMine(reference).then((res) => setOrder(res.order));
    refundStore.getForOrder(reference).then(setRefund);
  }, [reference]);

  const StatusIcon = useMemo(() => statusIcon(order?.status ?? ""), [order?.status]);
  const eligibility = useMemo(() => order ? refundEligibility(order) : { eligible: false }, [order]);

  if (order === undefined) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-4xl px-5 py-16 text-center text-sm text-muted-foreground">Loading…</section>
      </SiteLayout>
    );
  }

  if (order === null) {
    throw notFound();
  }

  function handleReorder() {
    if (!order) return;
    for (const it of order.items) {
      addItem({
        productId: it.productId,
        productName: it.productName,
        primaryImageUrl: it.primaryImageUrl,
        size: it.size,
        material: it.material,
        finish: it.finish,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      });
    }
    toast.success("Items added to cart");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
        <Link to="/account/orders" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> All orders
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Order</p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl">{order.reference}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {new Date(order.createdAt).toLocaleString("en-KE")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusTone(order.status)}`}>
              <StatusIcon className="h-3.5 w-3.5" /> {order.status.replace(/_/g, " ")}
            </span>
            <button onClick={handleReorder} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              <RotateCcw className="h-3.5 w-3.5" /> Re-order
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg">Items</h2>
              <ul className="mt-4 divide-y divide-border">
                {order.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-4 py-4">
                    <img src={it.primaryImageUrl} alt={it.productName} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold">{it.productName}</p>
                      <p className="text-xs text-muted-foreground">{[it.size, it.material, it.finish].filter(Boolean).join(" · ")}</p>
                      <p className="text-xs text-muted-foreground">Qty {it.quantity.toLocaleString()} × {fmt(it.unitPrice)}</p>
                    </div>
                    <p className="font-semibold">{fmt(it.lineTotal)}</p>
                  </li>
                ))}
              </ul>
            </div>

            {order.trackingEvents && order.trackingEvents.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-lg">Tracking</h2>
                {order.trackingNumber && (
                  <p className="mt-1 text-xs text-muted-foreground">Tracking number: <span className="font-mono">{order.trackingNumber}</span></p>
                )}
                <ol className="mt-4 space-y-4">
                  {order.trackingEvents.map((ev, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <div>
                        <p className="text-sm font-semibold">{ev.label}</p>
                        {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
                        <p className="text-[11px] text-muted-foreground">{new Date(ev.at).toLocaleString("en-KE")}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg">Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{fmt(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shippingFee === 0 ? "Free" : fmt(order.shippingFee)}</dd></div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold"><dt>Total</dt><dd>{fmt(order.total)}</dd></div>
              </dl>
              <div className="mt-4 rounded-lg bg-secondary p-3 text-xs">
                <p className="font-semibold">{order.paymentMethod}</p>
                <p className="text-muted-foreground">{order.paymentStatus}{order.paymentReference ? ` · ${order.paymentReference}` : ""}</p>
                {order.failureReason && <p className="mt-1 text-destructive">{order.failureReason}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg">Delivery</h2>
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-semibold">{order.customerName}</p>
                <p className="flex items-start gap-2 text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {order.shippingAddress}, {order.city}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {order.customerPhone}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {order.customerEmail}</p>
                {order.notes && (
                  <p className="mt-2 rounded-lg bg-secondary p-2 text-xs"><Package className="mr-1 inline h-3 w-3" /> {order.notes}</p>
                )}
              </div>
            </div>

            <Link to="/products" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm hover:bg-secondary">
              <ShoppingBag className="h-4 w-4" /> Continue shopping
            </Link>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
