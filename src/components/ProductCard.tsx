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
      t.enabled !== false &&
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
  const tierUnitPrice = (t: any) => {
    const qty = Number(t.quantity) || 0;
    if (!qty) return 0;
    return tierPrice(t) / qty;
  };
  const tierKey = (t: any) => String(t.id ?? t.collectionName);
  // Baseline = highest per-unit price (smallest bundle) — savings measured against this.
  const baselineUnit = hasTiers
    ? Math.max(...tiers.map((t) => tierUnitPrice(t)))
    : 0;
  const tierSavingsPct = (t: any) => {
    if (!baselineUnit) return 0;
    const u = tierUnitPrice(t);
    if (!u || u >= baselineUnit) return 0;
    return Math.round(((baselineUnit - u) / baselineUnit) * 100);
  };

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
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-secondary sm:aspect-[4/3]">
        <img
          src={image}
          alt={p.name}
          loading="lazy"
          style={{ objectPosition: "center" }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Single most-relevant badge to reduce clutter on mobile */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3">
          {stock.state === "out_of_stock" ? (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-destructive-foreground sm:px-2.5 sm:py-1 sm:text-[10px]">
              Backorder
            </span>
          ) : p.isDiscount ? (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent-foreground sm:px-2.5 sm:py-1 sm:text-[10px]">
              -{p.discountPercent ?? 10}%
            </span>
          ) : p.isNewArrival ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground sm:px-2.5 sm:py-1 sm:text-[10px]">
              New
            </span>
          ) : p.isFastMoving ? (
            <span className="rounded-full bg-kraft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-kraft-foreground sm:px-2.5 sm:py-1 sm:text-[10px]">
              Hot
            </span>
          ) : null}
          {stock.state === "low_stock" && (
            <span className="hidden rounded-full bg-accent/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent-foreground sm:inline-block sm:px-2.5 sm:py-1 sm:text-[10px]">
              Low stock
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <span className="hidden self-start rounded-full border border-kraft/30 bg-kraft/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-kraft sm:inline-block">
          {p.category}
        </span>
        <h3 className="font-display text-sm font-semibold leading-snug text-foreground line-clamp-2 sm:mt-2 sm:text-base">
          {p.name}
        </h3>
        {p.description && (
          <p className="mt-1 hidden text-[11px] leading-snug text-muted-foreground line-clamp-2 sm:line-clamp-2 sm:block sm:text-xs">
            {p.description}
          </p>
        )}

        {/* Tier pills: name + piece count; savings badge only on top tier */}
        {hasTiers && (
          <div className="mt-1.5 hidden flex-wrap gap-1 sm:mt-2 sm:flex">
            {tiers.map((t: any) => {
              const id = tierKey(t);
              const isActive = id === activeTierId;
              const isTopTier = tierKey(t) === tierKey(cheapestTier) && tiers.length > 1;
              const topSave = tierSavingsPct(cheapestTier);
              const label = t.uomName ?? t.collectionName;
              const qty = Number(t.quantity) || 0;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={(e) => handlePillClick(e, id)}
                  title={t.uomDescription ?? undefined}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <span>
                    {label} · {qty.toLocaleString()} pcs
                  </span>
                  {isTopTier && topSave > 0 && (
                    <span className="rounded-full bg-forest/15 px-1.5 py-px text-[9px] font-semibold text-forest">
                      Save {topSave}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {hasTiers && activeTier ? (
          <div className="mt-1.5 sm:mt-2">
            <p className="text-[13px] sm:text-sm">
              <span className="font-semibold text-primary">
                KES {tierPrice(activeTier).toLocaleString()}
              </span>
              <span className="ml-1 text-[11px] text-muted-foreground sm:text-xs">
                / {activeTier.uomName ?? activeTier.collectionName} ({(Number(activeTier.quantity) || 0).toLocaleString()} pcs)
              </span>
            </p>
            {activeTier.uomDescription && (
              <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                {activeTier.uomDescription}
              </p>
            )}
            {tiers.length > 1 && tierKey(activeTier) !== tierKey(cheapestTier) && tierSavingsPct(cheapestTier) > 0 && (
              <p className="mt-0.5 text-[11px] font-medium text-forest">
                Switch to {cheapestTier.uomName ?? cheapestTier.collectionName} and save {tierSavingsPct(cheapestTier)}%
              </p>
            )}
          </div>
        ) : individualEnabled && p.basePrice ? (
          <p className="mt-1.5 text-[13px] font-semibold text-primary sm:mt-2 sm:text-sm">
            KES {p.basePrice.toLocaleString()} <span className="font-normal text-muted-foreground">/ unit</span>
          </p>
        ) : (
          <p className="mt-1.5 text-[11px] text-muted-foreground sm:mt-2 sm:text-sm">Contact for pricing</p>
        )}

        <div className="mt-auto flex flex-col gap-1.5 pt-2 sm:gap-2 sm:pt-3">
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            {hasTiers && smallestTier
              ? `Min. order: 1 ${smallestTier.uomName ?? smallestTier.collectionName} (${(Number(smallestTier.quantity) || 0).toLocaleString()} pcs)`
              : `Min. ${p.moq.toLocaleString()} units`}
          </p>
          <button
            type="button"
            onClick={handleCTAClick}
            className="w-full rounded-full bg-accent px-2 py-2 text-[11px] font-semibold leading-tight text-accent-foreground transition-opacity hover:opacity-90 sm:px-3 sm:text-xs"
          >
            <span className="sm:hidden">
              {hasTiers || (individualEnabled && p.basePrice) ? "Add to cart" : "Get a quote"}
            </span>
            <span className="hidden sm:inline">
              {hasTiers && activeTier
                ? `Add to cart · ${activeTier.uomName ?? activeTier.collectionName}`
                : individualEnabled && p.basePrice
                ? "Add to cart"
                : "Get a quote"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
