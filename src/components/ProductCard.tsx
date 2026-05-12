import { useNavigate } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { apiUrl } from "@/config/api";
import { getStockInfo } from "@/lib/stock";

interface ProductCardProps {
  product: Product;
  onConfigure: (product: Product) => void;
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
    .filter((t) => {
      if (!t || !t.collectionName) return false;
      if (t.collectionName === "Legacy Tier") return false;
      const qty = Number(t.quantity);
      const price =
        Number(t.collectionPrice ?? Number(t.pricePerUnit) * Number(t.quantity));
      return qty > 0 && price > 0;
    })
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))) as Array<any>;
  const hasTiers = tiers.length > 0;
  const individualEnabled = p.individualSalesEnabled !== false;
  const smallestTier = tiers[0];
  const cheapestTier = tiers[tiers.length - 1];
  const tierPrice = (t: any) =>
    Number(t.collectionPrice ?? Number(t.pricePerUnit) * Number(t.quantity)) || 0;

  const handleCardClick = () => {
    trackClick(p.id);
    navigate({ to: "/products/$slug", params: { slug: p.slug } });
  };

  return (
    <article
      onClick={handleCardClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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

        {hasTiers ? (
          tiers.length === 1 ? (
            <p className="mt-1 text-sm text-primary">
              KES {tierPrice(smallestTier).toLocaleString()} / {smallestTier.collectionName}
            </p>
          ) : (
            <div className="mt-1 space-y-0.5">
              <p className="text-sm text-primary">
                From KES {tierPrice(cheapestTier).toLocaleString()} / {cheapestTier.collectionName}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Starts at KES {tierPrice(smallestTier).toLocaleString()} / {smallestTier.collectionName}
              </p>
            </div>
          )
        ) : individualEnabled && p.basePrice ? (
          <p className="mt-1 text-sm text-primary">
            KES {p.basePrice.toLocaleString()} / unit
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Contact for pricing</p>
        )}

        {hasTiers && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tiers.slice(0, 3).map((t: any) => (
              <span
                key={t.id ?? t.collectionName}
                className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {t.collectionName}
              </span>
            ))}
            {tiers.length > 3 && (
              <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                +{tiers.length - 3} more
              </span>
            )}
          </div>
        )}

        <p className="mt-1 text-xs text-muted-foreground">
          Min. {p.moq.toLocaleString()} units
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onConfigure(p);
          }}
          className="mt-3 w-full rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          {hasTiers ? "Choose collection" : "Configure & add"}
        </button>
      </div>
    </article>
  );
}
