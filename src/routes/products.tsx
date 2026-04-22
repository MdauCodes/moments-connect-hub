import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { categories, products } from "@/data/products";
import { useBasket } from "@/contexts/BasketContext";
import { z } from "zod";

const searchSchema = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Packaging Catalogue — Paper Bags, Cups, Boxes & Mailers Kenya | Moments Packaging" },
      {
        name: "description",
        content:
          "Browse Kenya's full custom paper packaging catalogue: kraft bags, hot/cold cups, food boxes, e-commerce mailers, labels and gifting boxes. Low MOQ from 100 units. WhatsApp to order.",
      },
      { property: "og:title", content: "Packaging Catalogue — Moments Packaging Kenya" },
      { property: "og:description", content: "Custom paper packaging catalogue — bags, cups, boxes, mailers, labels and gifting." },
    ],
    links: [{ rel: "canonical", href: "https://www.momentspackaging.com/products" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const basket = useBasket();
  const filtered = category ? products.filter((p) => p.category === category) : products;
  const activeCat = categories.find((c) => c.slug === category);

  return (
    <SiteLayout>
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8 lg:py-20">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Catalogue</p>
          <h1 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl lg:text-6xl">
            {activeCat ? activeCat.name : "Every type of packaging."}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {activeCat ? activeCat.blurb : "Browse by category. Tap any product to view details and order via WhatsApp or request a custom quote."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:pb-24 lg:px-8">
        {/* Category pills */}
        <div className="sticky top-[73px] z-20 -mx-5 flex gap-2 overflow-x-auto border-b border-border bg-background/95 px-5 py-3 backdrop-blur sm:py-4 lg:top-[77px] lg:mx-0 lg:rounded-full lg:border lg:px-3">
          <button
            onClick={() => navigate({ search: {} })}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
              !category ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary"
            }`}
          >
            All products
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => navigate({ search: { category: c.slug } })}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                category === c.slug ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to="/products/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${
                        t === "Discounted"
                          ? "bg-accent text-accent-foreground"
                          : t === "New"
                          ? "bg-forest text-forest-foreground"
                          : "bg-background/90 text-foreground"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl text-foreground">{p.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">MOQ</p>
                    <p className="font-display text-lg text-foreground">{p.moq.toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-medium text-accent">View →</span>
                </div>
                {basket.isInBasket(p.id) ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      basket.remove(p.id);
                    }}
                    className="mt-4 w-full rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/15"
                  >
                    ✓ Added — tap to remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      basket.add({
                        productId: p.id,
                        name: p.name,
                        image: p.image,
                        qty: p.moq,
                        size: "Medium",
                        finish: "Standard",
                        moq: p.moq,
                      });
                    }}
                    className="mt-4 w-full rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    + Add to enquiry
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
            No products in this category yet.
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
