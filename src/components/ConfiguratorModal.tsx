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
  const [quantity, setQuantity] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Reset state on product change
  useEffect(() => {
    if (!product) return;
    setSize(product.sizes?.[0] ?? "");
    setMaterial(product.materials?.[0] ?? product.material ?? "");
    setFinish(product.finish ?? "Standard");
    setQuantity(product.moq);
    setError(null);
    setSaved(false);
  }, [product]);

  const unitPrice = product?.basePrice ?? 0;
  const lineTotal = useMemo(() => quantity * unitPrice, [quantity, unitPrice]);

  if (!product) return null;

  const handleQtyBlur = () => {
    if (quantity < product.moq) {
      setQuantity(product.moq);
      setError(null);
    }
  };

  const handleQtyChange = (v: string) => {
    const n = Number(v);
    if (Number.isNaN(n)) return;
    setQuantity(n);
    if (n < product.moq) setError(`Minimum order is ${product.moq.toLocaleString()} units`);
    else setError(null);
  };

  const handleAdd = () => {
    if (quantity < product.moq) {
      setError(`Minimum order is ${product.moq.toLocaleString()} units`);
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
    // POST /api/v1/customer/wishlist/[productId] — wired in Prompt 3 with auth headers.
  };

  return (
    <Sheet open={!!product} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto bg-background p-0 sm:max-w-lg"
      >
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
          {/* Thumb */}
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
              <p className="mt-1 text-xs text-muted-foreground">
                Min. {product.moq.toLocaleString()} units
              </p>
            </div>
          </div>

          {/* Size */}
          {product.sizes && product.sizes.length > 0 && (
            <Section label="Size">
              <PillGroup
                options={product.sizes}
                value={size}
                onChange={setSize}
              />
            </Section>
          )}

          {/* Material */}
          {(product.materials?.length ?? 0) > 0 && (
            <Section label="Material">
              <PillGroup
                options={product.materials!}
                value={material}
                onChange={setMaterial}
              />
            </Section>
          )}

          {/* Finish */}
          {finish && (
            <Section label="Finish">
              <PillGroup
                options={[finish]}
                value={finish}
                onChange={setFinish}
              />
            </Section>
          )}

          {/* Quantity */}
          <Section
            label="Quantity"
            note={`(Min. ${product.moq.toLocaleString()} units)`}
          >
            <input
              type="number"
              min={product.moq}
              step={1}
              value={quantity}
              onChange={(e) => handleQtyChange(e.target.value)}
              onBlur={handleQtyBlur}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}
          </Section>

          {/* Price summary */}
          <div className="rounded-xl bg-primary px-5 py-4 text-primary-foreground">
            {unitPrice > 0 ? (
              <p className="text-sm">
                {quantity.toLocaleString()} units × KES {unitPrice.toLocaleString()} ={" "}
                <span className="font-display text-lg font-semibold">
                  KES {lineTotal.toLocaleString()}
                </span>
              </p>
            ) : (
              <p className="text-sm">
                Price calculated on order — our team will confirm.
              </p>
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
            <Heart
              className={`h-4 w-4 ${saved ? "fill-accent text-accent" : ""}`}
            />
            {saved ? "Saved to wishlist" : "Save to wishlist"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
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

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
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
