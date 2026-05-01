import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { orderStore, type CustomerOrder } from "@/services/orderStore";

export const Route = createFileRoute("/account/orders")({
  head: () => ({ meta: [{ title: "My orders — Moments Packaging" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ProtectedRoute>
      <MyOrdersPage />
    </ProtectedRoute>
  ),
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
}

function MyOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);

  useEffect(() => {
    orderStore.listMine().then((res) => setOrders(res.rows));
  }, []);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
        <h1 className="font-display text-3xl sm:text-4xl">My orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Recent orders and their payment status.
        </p>

        {orders === null ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
            <Link to="/products" className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-primary/90">Browse catalogue</Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {orders.map((o) => (
              <li key={o.reference}>
                <Link
                  to="/orders/track"
                  search={{ ref: o.reference }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
                >
                  <div>
                    <p className="font-display text-lg">{o.reference}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString("en-KE")} · {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{o.status.replace(/_/g, " ")}</span>
                    <span className="font-semibold">{fmt(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </SiteLayout>
  );
}
