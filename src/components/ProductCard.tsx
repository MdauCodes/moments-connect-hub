/**
 * ProductCard — typographic, graphic-first card.
 *
 * Replaces image-heavy AI-generated product cards with an editorial,
 * Helvetica-style spec block. The product's two-letter code becomes
 * the visual anchor (oversized display number). This is intentionally
 * card-less: paper-grain background, hairline rule on hover only.
 */
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/data/products";

const divisionAccent: Record<Product["division"], string> = {
  food: "var(--clay)",
  "retail-industrial": "var(--forest)",
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group relative block border-t border-border bg-cream py-7 transition-colors hover:bg-secondary/40"
    >
      <div className="grain pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative flex items-start gap-6 px-5">
        <div
          className="grid h-20 w-20 shrink-0 place-items-center font-display text-3xl font-medium tracking-tight text-background"
          style={{ backgroundColor: divisionAccent[product.division] }}
        >
          {product.code}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {product.division === "food" ? "Food Service" : "Retail & Industrial"} · {product.id.toUpperCase()}
          </p>
          <h3 className="mt-1.5 font-display text-2xl font-medium leading-tight text-foreground">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>
              MOQ <span className="text-foreground">{product.moq.toLocaleString()}</span>
            </span>
            <span>
              Sizes <span className="text-foreground">{product.sizes.length}</span>
            </span>
            <span>
              Lead <span className="text-foreground">7–14 days</span>
            </span>
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </Link>
  );
}
