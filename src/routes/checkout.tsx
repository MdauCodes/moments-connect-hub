import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Smartphone, Banknote, Truck, Lock } from "lucide-react";
import { InlineProgress } from "@/components/InlineProgress";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { orderStore, computeShippingFee, SHIPPING_THRESHOLD_KES } from "@/services/orderStore";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Moments Packaging Kenya" },
      { name: "description", content: "Securely place your packaging order with M-Pesa." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function fmt(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";
const labelCls = "block text-sm font-medium text-foreground mb-1.5";

function normalizePhone(p: string): string {
  const digits = p.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
}

function isValidKenyanPhone(p: string) {
  const n = normalizePhone(p);
  return /^254[71]\d{8}$/.test(n);
}

function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(`${user.firstName} ${user.lastName}`.trim());
      setEmail(user.email);
    }
  }, [user]);

  // If cart is empty, send back to /cart
  useEffect(() => {
    if (items.length === 0) navigate({ to: "/cart", replace: true });
  }, [items.length, navigate]);

  if (items.length === 0) return null;

  const shippingFee = computeShippingFee(cartTotal);
  const total = cartTotal + shippingFee;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidKenyanPhone(phone)) {
      toast.error("Enter a valid Kenyan phone (e.g. 0712 345 678)");
      return;
    }
    setSubmitting(true);
    try {
      const { order } = await orderStore.placeOrder({
        items,
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: normalizePhone(phone),
          address: address.trim(),
          city: city.trim(),
          notes: notes.trim() || undefined,
        },
        shippingFee,
        paymentMethod: "MPESA",
      });
      // Trigger STK push (mock or live)
      await orderStore.startMpesaStk(order.reference, normalizePhone(phone));
      // Clear cart now — order is persisted in orderStore for tracking
      clearCart();
      navigate({ to: "/checkout/processing", search: { ref: order.reference } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAuthenticated ? "Confirm your details to place the order." : (
            <>Checking out as a guest. <Link to="/account/login" search={{ redirect: "/checkout" }} className="text-accent hover:underline">Sign in</Link> for faster checkout next time.</>
          )}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="font-display text-xl">Contact & delivery</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Full name *</label>
                  <input className={inputCls} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Wanjiru" />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" className={inputCls} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <label className={labelCls}>Phone (M-Pesa) *</label>
                  <input className={inputCls} required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" inputMode="tel" />
                </div>
                <div>
                  <label className={labelCls}>City / town *</label>
                  <input className={inputCls} required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Nairobi" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Delivery address *</label>
                  <input className={inputCls} required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Building, street, estate" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Order notes (optional)</label>
                  <textarea className={inputCls + " min-h-[88px]"} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Brand colour, artwork instructions, preferred delivery day…" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="font-display text-xl">Payment</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose how you'd like to pay. Only M-Pesa STK is enabled for now — bank transfer and cash on delivery are coming soon.
              </p>

              <div className="mt-4 space-y-3">
                {/* M-Pesa STK — enabled */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-accent bg-accent/5 p-4">
                  <input type="radio" name="paymentMethod" value="PAYHERO" defaultChecked className="mt-1 h-4 w-4 accent-accent" />
                  <Smartphone className="mt-0.5 h-5 w-5 text-accent" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">M-Pesa STK push</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      A prompt will appear on your phone to confirm the payment of {fmt(total)}.
                    </p>
                  </div>
                </label>

                {/* Bank transfer — visible but disabled */}
                <label
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 opacity-60"
                >
                  <input type="radio" name="paymentMethod" value="BANK_TRANSFER" disabled className="mt-1 h-4 w-4" />
                  <Banknote className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">Bank transfer</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Lock className="h-3 w-3" /> Coming soon
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pay via direct deposit to our bank account.
                    </p>
                  </div>
                </label>

                {/* Cash on delivery — visible but disabled */}
                <label
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 opacity-60"
                >
                  <input type="radio" name="paymentMethod" value="CASH_ON_DELIVERY" disabled className="mt-1 h-4 w-4" />
                  <Truck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">Cash on delivery</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Lock className="h-3 w-3" /> Coming soon
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pay our courier in cash on arrival.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="font-display text-xl">Your order</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3">
                    <span className="text-foreground/90">
                      {it.productName} <span className="text-muted-foreground">× {it.quantity}</span>
                    </span>
                    <span>{fmt(it.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{fmt(cartTotal)}</dd></div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{shippingFee === 0 ? <span className="text-accent">Free</span> : fmt(shippingFee)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 font-display text-base">
                  <dt>Total</dt><dd>{fmt(total)}</dd>
                </div>
              </dl>
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? (<><InlineProgress size="md" /> Placing order…</>) : (<>Pay {fmt(total)} with M-Pesa <ArrowRight className="h-4 w-4" /></>)}
              </button>
              <p className="mt-3 text-[11px] text-muted-foreground">
                By placing the order you agree to our terms. Free shipping over {fmt(SHIPPING_THRESHOLD_KES)}.
              </p>
            </div>
          </aside>
        </form>
      </section>
    </SiteLayout>
  );
}
