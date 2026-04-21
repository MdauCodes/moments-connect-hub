import { Link, useNavigate } from "@tanstack/react-router";
import { MessageCircle, X } from "lucide-react";
import { useBasket } from "@/contexts/BasketContext";
import { usePersona } from "@/contexts/PersonaContext";
import { WHATSAPP_NUMBER } from "@/data/products";

const SIZE_OPTIONS = ["Small", "Medium", "Large", "Custom"] as const;
const FINISH_OPTIONS = ["Standard", "Foil print", "Embossed", "Spot UV"] as const;

interface BasketDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function BasketDrawer({ open, onClose }: BasketDrawerProps) {
  const { items, count, remove, updateQty, updateSize, updateFinish } = useBasket();
  const { persona } = usePersona();
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    const message =
      "Hi Moments Packaging! I'd like to enquire:\n\n" +
      items
        .map(
          (item, i) =>
            `${i + 1}. ${item.name} — Qty: ${item.qty}, Size: ${item.size}, Finish: ${item.finish}`,
        )
        .join("\n") +
      "\n\nPlease send me a quote. Thank you!";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleEnquiry = () => {
    onClose();
    navigate({ to: "/contact", state: { basketItems: items } as never });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-ink/20 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Your enquiry basket"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="font-display text-2xl text-foreground">Your enquiry</h2>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              {count} item{count !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close basket"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="max-w-xs text-sm text-muted-foreground">
                No products added yet. Browse our catalogue to add products.
              </p>
              <Link
                to="/products"
                onClick={onClose}
                className="mt-5 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Browse catalogue
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm text-foreground">{item.name}</h3>
                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={item.size}
                        onChange={(e) => updateSize(item.productId, e.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                        aria-label="Size"
                      >
                        {SIZE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <select
                        value={item.finish}
                        onChange={(e) => updateFinish(item.productId, e.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                        aria-label="Finish"
                      >
                        {FINISH_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground" htmlFor={`qty-${item.productId}`}>
                        Qty
                      </label>
                      <input
                        id={`qty-${item.productId}`}
                        type="number"
                        min={item.moq}
                        step={100}
                        value={item.qty}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          updateQty(item.productId, Number.isFinite(v) ? v : item.moq);
                        }}
                        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      MOQ {item.moq.toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border bg-background px-6 py-5">
            {persona === "sme" ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 hover:shadow-xl"
                >
                  <MessageCircle className="h-4 w-4" /> Order via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleEnquiry}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Submit as email enquiry instead
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEnquiry}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Request a formal quote →
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
