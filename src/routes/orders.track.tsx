import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineProgress } from "@/components/InlineProgress";
import { useEffect, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { orderStore, type CustomerOrder } from "@/services/orderStore";

const searchSchema = z.object({ ref: z.string().optional() });

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email ?? "";
  const [user, domain] = email.split("@");
  const u = user.length <= 2 ? user[0] + "*" : user[0] + "***" + user[user.length - 1];
  return `${u}@${domain}`;
}

export const Route = createFileRoute("/orders/track")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Track your order — Moments Packaging Kenya" },
      { name: "description", content: "Look up the status of your packaging order using your reference number." },
    ],
  }),
  component: TrackPage,
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";

function TrackPage() {
  const initial = Route.useSearch();
  const [ref, setRef] = useState(initial.ref ?? "");
  const [contact, setContact] = useState(initial.contact ?? "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [searched, setSearched] = useState(false);

  async function lookup(reference: string, c: string) {
    setLoading(true);
    setSearched(true);
    try {
      const { order: o } = c
        ? await orderStore.lookup(reference, c)
        : await orderStore.getStatus(reference);
      setOrder(o);
      if (!o) toast.error("No order found with those details");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initial.ref) lookup(initial.ref, initial.contact ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ref.trim()) return;
    lookup(ref.trim(), contact.trim());
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
        <h1 className="font-display text-3xl sm:text-4xl">Track your order</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the order reference we sent you. Add your email or phone for guest orders.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input className={inputCls} placeholder="Order reference (e.g. MP-12345)" value={ref} onChange={(e) => setRef(e.target.value)} />
          <input className={inputCls} placeholder="Email or phone" value={contact} onChange={(e) => setContact(e.target.value)} />
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {loading ? <InlineProgress size="sm" /> : <Search className="h-4 w-4" />}
            Track
          </button>
        </form>

        {searched && !loading && !order && (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            We couldn't find that order. Double-check the reference or <Link to="/contact" className="text-accent hover:underline">contact us</Link>.
          </div>
        )}

        {order && (
          <article className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Order</p>
                <h2 className="font-display text-2xl">{order.reference}</h2>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                {order.status.replace(/_/g, " ")}
              </span>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">Placed</dt><dd>{new Date(order.createdAt).toLocaleString("en-KE")}</dd></div>
              <div><dt className="text-muted-foreground">Total</dt><dd className="font-semibold">{fmt(order.total)}</dd></div>
              <div><dt className="text-muted-foreground">Payment</dt><dd>{order.paymentStatus} · {order.paymentMethod}</dd></div>
              <div><dt className="text-muted-foreground">Delivery to</dt><dd>{order.shippingAddress}, {order.city}</dd></div>
              {order.trackingNumber && <div><dt className="text-muted-foreground">Tracking #</dt><dd>{order.trackingNumber}</dd></div>}
            </dl>

            <div className="mt-6">
              <h3 className="text-sm font-semibold">Items</h3>
              <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                {order.items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <span>{it.productName} <span className="text-muted-foreground">× {it.quantity}</span></span>
                    <span>{fmt(it.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {order.trackingEvents && order.trackingEvents.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold">Activity</h3>
                <ol className="mt-2 space-y-3 border-l border-border pl-4">
                  {order.trackingEvents.slice().reverse().map((e, i) => (
                    <li key={i} className="text-sm">
                      <p className="font-medium text-foreground">{e.label}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.at).toLocaleString("en-KE")}{e.description ? ` · ${e.description}` : ""}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </article>
        )}
      </section>
    </SiteLayout>
  );
}
