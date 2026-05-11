import { useEffect, useMemo, useState } from "react";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface ConfiguratorModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ConfiguratorModal({ product, onClose }: ConfiguratorModalProps) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [size, setSize] = useState<string>("");
  const [material, setMaterial] = useState<string>("");
  const [finish, setFinish] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  const collectionTiers = useMemo(() => {
    if (!product) return [];
    return (product.pricingTiers ?? [])
      .filter((t: any) => t.collectionName && t.quantity)
      .slice()
      .sort((a: any, b: any) => (a.sortOrder ?? a.quantity) - (b.sortOrder ?? b.quantity));
  }, [product]);

  const hasCollections = collectionTiers.length > 0;
  const individualEnabled = product ? (product.individualSalesEnabled ?? !hasCollections) : true;

  const selectedTier = useMemo(
    () =>
      hasCollections && selectedTierId
        ? (collectionTiers.find((t: any) => (t.id ?? `tier-${collectionTiers.indexOf(t)}`) === selectedTierId) as any)
        : null,
    [collectionTiers, hasCollections, selectedTierId],
  );

  useEffect(() => {
    if (!product) return;
    setSize(product.sizes?.[0] ?? "");
    setMaterial(product.materials?.[0] ?? product.material ?? "");
    setFinish(product.finish ?? "Standard");
    setError(null);
    setSaved(false);
    if (hasCollections) {
      const first = collectionTiers[0] as any;
      setSelectedTierId(first.id ?? `tier-0`);
      setQuantity(1);
    } else {
      setSelectedTierId(null);
      setQuantity(product.moq);
    }
  }, [product]);

  const unitPrice = selectedTier ? Number(selectedTier.pricePerUnit) || 0 : (product?.basePrice ?? 0);
  const collectionQty = selectedTier ? Number(selectedTier.quantity) || 0 : 0;
  const collectionPrice = selectedTier ? Number(selectedTier.collectionPrice ?? unitPrice * collectionQty) || 0 : 0;
  const lineTotal = selectedTier ? quantity * collectionPrice : quantity * unitPrice;
  const minQty = selectedTier ? 1 : (product?.moq ?? 1);

  if (!product) return null;

  const handleSelectTier = (key: string | null) => {
    setSelectedTierId(key);
    setQuantity(1);
    setError(null);
  };

  const handleQtyChange = (v: string) => {
    const n = Number(v);
    if (Number.isNaN(n)) return;
    setQuantity(n);
    setError(n < minQty ? `Minimum: ${minQty.toLocaleString()}` : null);
  };

  const handleAdd = () => {
    if (quantity < minQty) {
      setError(`Minimum: ${minQty.toLocaleString()}`);
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      primaryImageUrl: product.primaryImageUrl ?? product.image,
      size: size || "Standard",
      material: material || "Standard",
      finish: finish || "Standard",
      quantity,
      unitPrice,
      tierId: selectedTier ? selectedTierId : null,
      collectionName: selectedTier?.collectionName,
      collectionQuantity: selectedTier ? collectionQty : undefined,
      totalUnits: selectedTier ? quantity * collectionQty : quantity,
    });
    toast.success("Added to cart", { duration: 2000 });
    onClose();
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate({ to: "/account/login" });
      return;
    }
    setSaved((s) => !s);
    toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <Sheet open={!!product} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-background p-0 sm:max-w-lg">
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-xl text-foreground">{product.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-xl bg-secondary">
              <img
                src={product.primaryImageUrl ?? product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="rounded-full border border-kraft/30 bg-kraft/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-kraft">
                {product.category}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">Min. {product.moq.toLocaleString()} units</p>
            </div>
          </div>

          {/* Collection tier selection */}
          {hasCollections && (
            <Section label="Choose how to buy">
              <div className="grid gap-2 grid-cols-2">
                {collectionTiers.map((t: any, i: number) => {
                  const key = t.id ?? `tier-${i}`;
                  const active = key === selectedTierId;
                  const cPrice = Number(t.collectionPrice ?? Number(t.pricePerUnit) * Number(t.quantity)) || 0;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectTier(key)}
                      className={`flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        active
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                          : "border-border bg-card hover:border-foreground/40"
                      }`}
                    >
                      <span className="font-display text-sm text-foreground">{t.collectionName}</span>
                      <span className="mt-0.5 text-[11px] text-muted-foreground">
                        {Number(t.quantity).toLocaleString()} units
                      </span>
                      <span className="mt-1.5 text-sm font-semibold text-foreground">
                        KES {cPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        KES {Number(t.pricePerUnit).toLocaleString()}/unit
                      </span>
                    </button>
                  );
                })}
                {individualEnabled && (
                  <button
                    type="button"
                    onClick={() => handleSelectTier(null)}
                    className={`flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      selectedTierId === null
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border bg-card hover:border-foreground/40"
                    }`}
                  >
                    <span className="font-display text-sm text-foreground">Individual units</span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">Buy any quantity</span>
                    <span className="mt-1.5 text-sm font-semibold text-foreground">
                      KES {(product.basePrice ?? 0).toLocaleString()}/unit
                    </span>
                  </button>
                )}
              </div>
            </Section>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <Section label="Size">
              <PillGroup options={product.sizes} value={size} onChange={setSize} />
            </Section>
          )}
          {(product.materials?.length ?? 0) > 0 && (
            <Section label="Material">
              <PillGroup options={product.materials!} value={material} onChange={setMaterial} />
            </Section>
          )}
          {finish && (
            <Section label="Finish">
              <PillGroup options={[finish]} value={finish} onChange={setFinish} />
            </Section>
          )}

          <Section
            label={selectedTier ? `Number of ${selectedTier.collectionName}s` : "Quantity"}
            note={selectedTier ? `(${collectionQty} units each)` : `(Min. ${minQty.toLocaleString()})`}
          >
            <input
              type="number"
              min={minQty}
              step={1}
              value={quantity}
              onChange={(e) => handleQtyChange(e.target.value)}
              onBlur={() => {
                if (quantity < minQty) {
                  setQuantity(minQty);
                  setError(null);
                }
              }}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}
          </Section>

          <div className="rounded-xl bg-primary px-5 py-4 text-primary-foreground">
            {selectedTier ? (
              <p className="text-sm">
                {quantity.toLocaleString()} × {selectedTier.collectionName} ({collectionQty} units) ={" "}
                <span className="font-display text-lg font-semibold">KES {lineTotal.toLocaleString()}</span>
                <span className="ml-2 text-xs opacity-80">
                  · {(quantity * collectionQty).toLocaleString()} total units
                </span>
              </p>
            ) : unitPrice > 0 ? (
              <p className="text-sm">
                {quantity.toLocaleString()} units × KES {unitPrice.toLocaleString()} ={" "}
                <span className="font-display text-lg font-semibold">KES {lineTotal.toLocaleString()}</span>
              </p>
            ) : (
              <p className="text-sm">Price calculated on order — our team will confirm.</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">Production: 7–14 business days</p>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            Add to cart
          </button>

          <button
            type="button"
            onClick={handleWishlist}
            className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-accent text-accent" : ""}`} />
            {saved ? "Saved to wishlist" : "Save to wishlist"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {note && <span className="ml-1 text-foreground/60 normal-case font-normal tracking-normal">{note}</span>}
      </p>
      {children}
    </div>
  );
}

function PillGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground/20 bg-cream text-foreground hover:border-foreground/40"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
