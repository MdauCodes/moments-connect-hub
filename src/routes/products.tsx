import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { useBasket } from "@/contexts/BasketContext";
import { api } from "@/services/api";
import type { Product, Industry } from "@/data/products";
import { categories } from "@/data/products";

const searchSchema = z.object({
  category: z.string().optional(),
  industry: z.string().optional(),
  q: z.string().optional(),
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
  const { category, industry: industrySlug } = Route.useSearch();
  const navigate = Route.useNavigate();
  const basket = useBasket();
  const activeCat = useMemo(() => categories.find((c) => c.slug === category), [category]);

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedIndustry = useMemo(
    () => industries.find((i) => i.slug === industrySlug) ?? null,
    [industries, industrySlug],
  );

  const setIndustrySlug = (slug: string | null) => {
    void navigate({
      search: (prev) => ({ ...prev, industry: slug ?? undefined }),
    });
  };

  // Load industries once
  useEffect(() => {
    let cancelled = false;
    void api.getIndustries().then((data) => {
      if (!cancelled) setIndustries(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load products when industry filter changes (and no active search)
  useEffect(() => {
    if (activeQuery.length > 1) return;
    let cancelled = false;
    setIsLoading(true);
    void api
      .getProducts(selectedIndustry ? { industryId: selectedIndustry.id } : undefined)
      .then((data) => {
        if (cancelled) return;
        const next = category ? data.filter((p) => p.category === category) : data;
        setProducts(next);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedIndustry, activeQuery, category]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setActiveQuery(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Run search when activeQuery changes (>1 char) — uses ranked search service
  useEffect(() => {
    if (activeQuery.length <= 1) return;
    let cancelled = false;
    setIsLoading(true);
    void api.searchProducts(activeQuery).then((data) => {
      if (cancelled) return;
      let next = category ? data.filter((p) => p.category === category) : data;
      if (selectedIndustry) {
        next = next.filter((p) => p.industryIds.includes(selectedIndustry.id));
      }
      setProducts(next);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeQuery, category, selectedIndustry]);

  const showingSearch = activeQuery.length > 1;

  return (
    <SiteLayout>
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8 lg:py-20">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Catalogue</p>
          <h1 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl lg:text-6xl">
            {activeCat ? activeCat.name : "Every type of packaging."}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {activeCat
              ? activeCat.blurb
              : "Browse by category. Tap any product to view details and order via WhatsApp or request a custom quote."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:pb-24 lg:px-8">
        {/* Search bar */}
        <div className="pt-6">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search packaging products..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {showingSearch && (
            <p className="mt-2 text-xs text-muted-foreground">
              {products.length} products found for &lsquo;{activeQuery}&rsquo;
            </p>
          )}
        </div>

        {/* Industry filter pills */}
        <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-3">
          <button
            type="button"
            onClick={() => setIndustrySlug(null)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
              selectedIndustry === null
                ? "bg-primary text-primary-foreground"
                : "cursor-pointer border border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            All industries
          </button>
          {industries.map((ind) => {
            const active = selectedIndustry?.id === ind.id;
            const Icon = ind.icon;
            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => setIndustrySlug(active ? null : ind.slug)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "cursor-pointer border border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                {ind.name}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          showingSearch ? (
            <div className="py-20 text-center">
              <p className="text-base text-foreground">
                No products found for &lsquo;{activeQuery}&rsquo;
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different term or browse by industry
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveQuery("");
                }}
                className="mt-4 text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
              No products in this category yet.
            </div>
          )
        ) : (
          <div className="mt-8 grid animate-in fade-in gap-5 duration-300 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                onClick={() => {
                  void api.trackClick(p.id);
                }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Status badges (top-left stack) */}
                  <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    {p.isNewArrival && (
                      <span className="rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                        New
                      </span>
                    )}
                    {p.isDiscount && (
                      <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                        -{p.discountPercent}%
                      </span>
                    )}
                    {p.isFastMoving && !p.isNewArrival && !p.isDiscount && (
                      <span className="rounded-full bg-orange-600/90 px-2.5 py-1 text-[10px] font-semibold text-white">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl text-foreground">{p.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
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
        )}
      </section>
    </SiteLayout>
  );
}
