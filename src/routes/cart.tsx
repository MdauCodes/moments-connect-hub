import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Trash2, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart } from "@/contexts/CartContext";
import { computeShippingFee, SHIPPING_THRESHOLD_KES } from "@/services/orderStore";
import { WHATSAPP_NUMBER } from "@/data/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Moments Packaging Kenya" },
      { name: "description", content: "Review your packaging order, adjust quantities, and proceed to checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
}

function CartPage() {
  const { items, updateQuantity, removeItem, cartTotal, cartLoading } = useCart();
  const navigate = useNavigate();

  const shippingFee = computeShippingFee(cartTotal);
  const total = cartTotal + shippingFee;

  function handleWhatsApp() {
    const lines = items.map((it, i) =>
      `${i + 1}. ${it.productName} — Qty ${it.quantity}, Size ${it.size}, Material ${it.material}, Finish ${it.finish}`,
    ).join("\n");
    const message = `Hi Moments Packaging, I'd like to enquire about a custom quote:\n\n${lines}\n\nTotal estimate: ${fmt(total)}\n\nCould you confirm pricing and lead time?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  }

  if (cartLoading) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
          <div className="shimmer h-9 w-48 rounded-md" />
          <div className="shimmer mt-2 h-4 w-64 rounded-md" />
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="shimmer h-28 w-full rounded-2xl" />
              ))}
            </div>
            <div className="shimmer h-72 w-full rounded-2xl lg:col-span-1" />
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (items.length === 0) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8 lg:py-28">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-6 font-display text-4xl">Your cart is empty</h1>
          <p className="mt-3 text-muted-foreground">
            Add packaging from the catalogue, then come back to check out.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse catalogue <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl">Your cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} item{items.length !== 1 ? "s" : ""} · review and proceed to checkout.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {items.map((it) => (
                <li key={it.id} className="flex gap-4 p-4 sm:p-5">
                  <img
                    src={it.primaryImageUrl}
                    alt={it.productName}
                    className="h-20 w-20 flex-shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-base text-foreground">{it.productName}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[it.variantLabel, it.size, it.material, it.finish].filter(Boolean).join(" · ")}
                          {it.sku && <span className="ml-2 text-foreground/40">SKU {it.sku}</span>}
                        </p>
                        {it.isBackorder && (
                          <p className="mt-1 inline-flex rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                            Backorder · ~21 days
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {fmt(it.unitPrice)} / unit
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        aria-label={`Remove ${it.productName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          Qty
                          <input
                            type="number"
                            min={10}
                            step={10}
                            value={it.quantity}
                            onChange={(e) => {
                              const v = Math.max(10, Number(e.target.value) || 10);
                              updateQuantity(it.id, v);
                            }}
                            onBlur={(e) => {
                              const v = Math.max(10, Number(e.target.value) || 10);
                              if (v !== it.quantity) updateQuantity(it.id, v);
                            }}
                            className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                          />
                        </label>
                        <p className="text-[11px] text-muted-foreground">Minimum order: 10 units</p>
                      </div>
                      <p className="font-display text-base">{fmt(it.lineTotal)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link to="/products" className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:underline">
              ← Continue shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="font-display text-xl">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{fmt(cartTotal)}</dd></div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{shippingFee === 0 ? <span className="text-accent">Free</span> : fmt(shippingFee)}</dd>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Free shipping on orders over {fmt(SHIPPING_THRESHOLD_KES)}.
                  </p>
                )}
                <div className="flex justify-between border-t border-border pt-3 font-display text-base">
                  <dt>Total</dt><dd>{fmt(total)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => navigate({ to: "/checkout" })}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                Proceed to checkout <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-5 rounded-xl border border-dashed border-border bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Need a custom price or longer lead time? Send this list to us first:
                </p>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-medium text-foreground hover:bg-secondary"
                >
                  <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp first
                </button>
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground">
                Pay securely with M-Pesa STK push. Card and bank options coming soon.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
