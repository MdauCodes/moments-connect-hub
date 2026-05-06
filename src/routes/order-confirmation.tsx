import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { orderStore, type CustomerOrder } from "@/services/orderStore";

const searchSchema = z.object({ ref: z.string() });

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Order confirmed — Moments Packaging" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmationPage,
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);
}

const BRAND = "#1a472a";

function OrderConfirmationPage() {
  const { ref } = Route.useSearch();
  const [order, setOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    orderStore.getStatus(ref).then((res) => setOrder(res.order));
  }, [ref]);

  const receipt = order?.paymentReference ?? order?.receiptNumber;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="rounded-3xl border border-border bg-card p-6 text-center sm:p-10">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${BRAND}15` }}
          >
            <CheckCircle2 className="h-9 w-9" style={{ color: BRAND }} />
          </div>
          <h1 className="mt-6 font-display text-3xl sm:text-4xl">Thank you — order confirmed</h1>
          <p className="mt-3 text-muted-foreground">
            We've received your payment. Your order{" "}
            <span className="font-semibold text-foreground">{ref}</span> is now in production.
            We'll be in touch within 24 hours with proofs and a delivery ETA.
          </p>

          {order && (
            <dl className="mx-auto mt-8 max-w-sm space-y-2 rounded-2xl border border-border bg-background p-5 text-left text-sm">
              <Row label="Order reference" value={ref} mono />
              {receipt && <Row label="M-Pesa receipt" value={receipt} mono />}
              <Row label="Total paid" value={fmt(order.total)} />
              <Row label="Delivery to" value={`${order.shippingAddress}, ${order.city}`} />
            </dl>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/orders/track"
              search={{ ref }}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              Track your order
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-foreground ${mono ? "font-mono font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}
