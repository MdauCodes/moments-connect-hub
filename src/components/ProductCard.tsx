import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { apiUrl } from "@/config/api";
import { getStockInfo } from "@/lib/stock";

interface ProductCardProps {
  product: Product;
  onConfigure: (product: Product, preSelectedTierId?: string) => void;
  variant?: "default" | "compact";
}

function trackClick(id: string) {
  fetch(apiUrl(`/api/v1/public/products/${encodeURIComponent(id)}/click`), {
    method: "POST",
  }).catch(() => {
    /* fire-and-forget */
  });
}

export function ProductCard({ product: p, onConfigure }: ProductCardProps) {
  const navigate = useNavigate();
  const stock = getStockInfo(p, null, 0);
  const image = p.primaryImageUrl ?? p.image;

  const tiers = (((p.pricingTiers ?? []) as any[])
    .filter((t) =>
      t &&
      t.collectionName &&
      t.collectionName !== "Legacy Tier" &&
      Number(t.quantity) > 0 &&
      Number(t.collectionPrice ?? 0) > 0
    )
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))) as Array<any>;

  const hasTiers = tiers.length > 0;
  const individualEnabled = p.individualSalesEnabled === true;
  const smallestTier = tiers[0];
  const cheapestTier = tiers[tiers.length - 1];
  const tierPrice = (t: any) =>
    Number(t.collectionPrice ?? Number(t.pricePerUnit) * Number(t.quantity)) || 0;
  const tierKey = (t: any) => String(t.id ?? t.collectionName);

  const [activeTierId, setActiveTierId] = useState<string | null>(
    hasTiers ? tierKey(tiers[0]) : null,
  );
  const activeTier = hasTiers
    ? tiers.find((t) => tierKey(t) === activeTierId) ?? tiers[0]
    : null;

  const handleCardClick = () => {
    trackClick(p.id);
    navigate({ to: "/products/$slug", params: { slug: p.slug } });
  };

  const handlePillClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveTierId(id);
  };

  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfigure(p, activeTierId ?? undefined);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        <img
          src={image}
          alt={p.name}
          loading="lazy"
          style={{ objectPosition: "center" }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {p.isNewArrival && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              New
            </span>
          )}
          {p.isDiscount && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
              -{p.discountPercent ?? 10}%
            </span>
          )}
          {p.isFastMoving && (
            <span className="rounded-full bg-kraft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-kraft-foreground">
              Hot
            </span>
          )}
          {stock.state === "out_of_stock" && (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground">
              Backorder
            </span>
          )}
          {stock.state === "low_stock" && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
              Low stock
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="self-start rounded-full border border-kraft/30 bg-kraft/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-kraft">
          {p.category}
        </span>
        <h3 className="mt-2 font-display text-base font-semibold text-foreground">
          {p.name}
        </h3>

        {hasTiers && activeTier ? (
          <div className="mt-1 space-y-0.5">
            <p className="text-sm">
              <span className="font-semibold text-primary">
                KES {tierPrice(activeTier).toLocaleString()}
              </span>
              <span className="ml-1 text-muted-foreground">
                / {activeTier.collectionName} ({Number(activeTier.quantity).toLocaleString()} units)
              </span>
            </p>
            {tiers.length > 1 && tierKey(activeTier) !== tierKey(cheapestTier) && (
              <p className="text-[11px] text-muted-foreground">
                Best value: KES {tierPrice(cheapestTier).toLocaleString()} / {cheapestTier.collectionName}
              </p>
            )}
          </div>
        ) : individualEnabled && p.basePrice ? (
          <p className="mt-1 text-sm text-primary">
            KES {p.basePrice.toLocaleString()} / unit
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Contact for pricing</p>
        )}

        {hasTiers && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tiers.map((t: any) => {
              const id = tierKey(t);
              const isActive = id === activeTierId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={(e) => handlePillClick(e, id)}
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {t.collectionName}
                </button>
              );
            })}
          </div>
        )}

        <p className="mt-1 text-xs text-muted-foreground">
          Min. {p.moq.toLocaleString()} units
        </p>
        <button
          type="button"
          onClick={handleCTAClick}
          className="mt-3 w-full rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          {hasTiers
            ? activeTier
              ? `Add ${activeTier.collectionName} to cart`
              : "Choose collection"
            : "Configure & add"}
        </button>
      </div>
    </article>
  );
}
