import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { DivisionBadge } from "@/components/DivisionBadge";
import {
  categories,
  categoriesByDivision,
  divisions,
  products,
  type Division,
} from "@/data/products";
import { z } from "zod";

const searchSchema = z.object({
  division: z.enum(["food", "retail-industrial"]).optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Catalogue — Food, Retail & Industrial Packaging | Moments Packaging Kenya" },
      {
        name: "description",
        content:
          "Browse our two divisions — Food Service Packaging and Retail & Industrial Packaging. Cups, boxes, kraft bags, mailers, labels, gifting and bulk supplies. WhatsApp to order.",
      },
      { property: "og:title", content: "Catalogue — Moments Packaging Kenya" },
      {
        property: "og:description",
        content: "Two divisions, one supplier — food and non-food packaging for Kenyan businesses.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { division, category } = Route.useSearch();
  const navigate = Route.useNavigate();

  const filtered = products.filter((p) => {
    if (division && p.division !== division) return false;
    if (category && p.category !== category) return false;
    return true;
  });

  const activeDivision: Division | undefined = division;
  const visibleCategories = activeDivision ? categoriesByDivision(activeDivision) : categories;

  return (
    <SiteLayout>
      {/* Heading — short */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Catalogue · {filtered.length} products
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-foreground sm:text-5xl">
            {activeDivision ? divisions[activeDivision].label : "All packaging"}
          </h1>
        </div>
      </section>

      {/* Division switcher — primary filter */}
      <section className="sticky top-[68px] z-30 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center gap-px overflow-x-auto bg-border">
            <button
              onClick={() => navigate({ search: {} })}
              className={`whitespace-nowrap px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                !activeDivision
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground/70 hover:bg-secondary"
              }`}
            >
              All products
            </button>
            <button
              onClick={() => navigate({ search: { division: "food" } })}
              className={`flex items-center gap-2 whitespace-nowrap px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                activeDivision === "food"
                  ? "bg-[color:var(--clay)] text-background"
                  : "bg-background text-foreground/70 hover:bg-secondary"
              }`}
            >
              <span className={`h-1.5 w-1.5 ${activeDivision === "food" ? "bg-background" : "bg-[color:var(--clay)]"}`} />
              Food Service
            </button>
            <button
              onClick={() => navigate({ search: { division: "retail-industrial" } })}
              className={`flex items-center gap-2 whitespace-nowrap px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                activeDivision === "retail-industrial"
                  ? "bg-[color:var(--forest)] text-background"
                  : "bg-background text-foreground/70 hover:bg-secondary"
              }`}
            >
              <span className={`h-1.5 w-1.5 ${activeDivision === "retail-industrial" ? "bg-background" : "bg-[color:var(--forest)]"}`} />
              Retail & Industrial
            </button>
          </div>
        </div>
      </section>

      {/* Category sub-filter */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Categories /
            </span>
            <button
              onClick={() =>
                navigate({ search: activeDivision ? { division: activeDivision } : {} })
              }
              className={`px-3 py-1.5 text-xs transition-colors ${
                !category
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground/70 hover:border-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {visibleCategories.map((c) => (
              <button
                key={c.slug}
                onClick={() =>
                  navigate({
                    search: activeDivision
                      ? { division: activeDivision, category: c.slug }
                      : { category: c.slug },
                  })
                }
                className={`px-3 py-1.5 text-xs transition-colors ${
                  category === c.slug
                    ? "bg-foreground text-background"
                    : "border border-border text-foreground/70 hover:border-foreground hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product list — editorial, hairline-divided */}
      <section className="mx-auto max-w-7xl px-0 pb-24 lg:px-8 lg:pb-32">
        {filtered.length === 0 ? (
          <div className="border-y border-dashed border-border px-5 py-24 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              No products match this filter.
            </p>
            <Link
              to="/products"
              className="mt-4 inline-block font-display text-xl text-foreground underline-offset-4 hover:underline"
            >
              View all products
            </Link>
          </div>
        ) : (
          <ul className="border-b border-border">
            {filtered.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}

        {/* Footer summary */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 px-5 lg:px-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Showing {filtered.length} of {products.length} · {activeDivision ? divisions[activeDivision].label : "All divisions"}
          </p>
          {activeDivision && (
            <DivisionBadge division={activeDivision} />
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
