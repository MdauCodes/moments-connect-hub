import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { ConfiguratorModal } from "@/components/ConfiguratorModal";
import { api } from "@/services/api";
import type { Product, Industry } from "@/data/products";

const searchSchema = z.object({
  category: z.string().optional(),
  industry: z.string().optional(),
  q: z.string().optional(),
  newArrivals: z.boolean().optional(),
  deals: z.boolean().optional(),
  fastMoving: z.boolean().optional(),
});

const PAGE_SIZE = 20;

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Packaging Catalogue — Order Custom Paper Packaging Online | Moments Packaging Kenya" },
      {
        name: "description",
        content:
          "Browse and configure custom paper packaging online: bags, cups, boxes, mailers, labels and gifting. Order from 100 units, delivered nationwide.",
      },
      { property: "og:title", content: "Packaging Catalogue — Moments Packaging Kenya" },
      {
        property: "og:description",
        content:
          "Custom paper packaging catalogue — configure online, pay with M-Pesa, delivered across Kenya.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.momentspackaging.com/products" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { category, industry: industrySlug, q, newArrivals, deals, fastMoving } = search;

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [query, setQuery] = useState(q ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [configuring, setConfiguring] = useState<Product | null>(null);

  const selectedIndustry = useMemo(
    () => industries.find((i) => i.slug === industrySlug) ?? null,
    [industries, industrySlug],
  );

  const anyFilterActive = !!(
    industrySlug || category || newArrivals || deals || fastMoving || (q && q.length > 1)
  );

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

  // Reset pagination when filters change
  useEffect(() => {
    setPage(0);
  }, [industrySlug, category, newArrivals, deals, fastMoving]);

  // Fetch products for current filters/page
  useEffect(() => {
    // Skip when actively searching
    if (searchResults !== null) return;
    let cancelled = false;
    if (page === 0) setIsLoading(true);
    else setIsLoadingMore(true);

    void api
      .getProducts({
        industryId: selectedIndustry?.id,
        category: category || undefined,
        isNewArrival: newArrivals || undefined,
        isDiscount: deals || undefined,
        isFastMoving: fastMoving || undefined,
        page,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      })
      .then((data) => {
        if (cancelled) return;
        setHasMore(data.length === PAGE_SIZE);
        setProducts((prev) => (page === 0 ? data : [...prev, ...data]));
      })
      .catch(() => {
        if (!cancelled && page === 0) setProducts([]);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
        setIsLoadingMore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedIndustry, category, newArrivals, deals, fastMoving, page, searchResults]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void navigate({ search: (prev) => ({ ...prev, q: query || undefined }) });

      if (query.trim().length < 2) {
        setSearchResults(null);
        return;
      }
      setIsLoading(true);
      void api
        .searchProducts(query.trim(), 12)
        .then((data) => setSearchResults(data))
        .catch(() => setSearchResults([]))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const toggleIndustry = (slug: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        industry: prev.industry === slug ? undefined : slug,
      }),
    });
  };

  const toggle = (key: "newArrivals" | "deals" | "fastMoving") => {
    void navigate({
      search: (prev) => ({ ...prev, [key]: prev[key] ? undefined : true }),
    });
  };

  const setCategoryParam = (value: string) => {
    void navigate({
      search: (prev) => ({ ...prev, category: value || undefined }),
    });
  };

  const clearAll = () => {
    setQuery("");
    setSearchResults(null);
    void navigate({ search: () => ({}) });
  };

  const grid = searchResults ?? products;

  return (
    <SiteLayout>
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8 lg:py-16">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Catalogue</p>
          <h1 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">
            Shop packaging
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Browse, configure and order branded paper packaging online. From 100 units.
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
              className="w-full rounded-xl border border-border bg-background px-4 py-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter row */}
        <div className="scrollbar-hide mt-4 flex items-center gap-2 overflow-x-auto pb-3">
          {industries.map((ind) => {
            const active = selectedIndustry?.id === ind.id;
            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => toggleIndustry(ind.slug)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-foreground/20 bg-cream text-foreground hover:border-foreground/40"
                }`}
              >
                {ind.name}
              </button>
            );
          })}

          <span className="mx-1 h-5 w-px bg-border" aria-hidden />

          <ToggleChip active={!!newArrivals} onClick={() => toggle("newArrivals")}>
            New Arrivals
          </ToggleChip>
          <ToggleChip active={!!deals} onClick={() => toggle("deals")}>
            Deals
          </ToggleChip>
          <ToggleChip active={!!fastMoving} onClick={() => toggle("fastMoving")}>
            Fast Moving
          </ToggleChip>

          <input
            type="text"
            value={category ?? ""}
            onChange={(e) => setCategoryParam(e.target.value)}
            placeholder="Filter by category…"
            className="ml-1 min-w-[180px] flex-shrink-0 rounded-full border border-foreground/20 bg-cream px-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />

          {anyFilterActive && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-2 whitespace-nowrap text-xs font-medium text-accent hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : grid.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center">
            <h3 className="font-display text-2xl text-foreground">No products found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-5 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid animate-in fade-in gap-5 duration-300 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {grid.map((p) => (
                <ProductCard key={p.id} product={p} onConfigure={setConfiguring} />
              ))}
            </div>

            {!searchResults && hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  disabled={isLoadingMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full border border-primary bg-background px-6 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
                >
                  {isLoadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <ConfiguratorModal product={configuring} onClose={() => setConfiguring(null)} />
    </SiteLayout>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-foreground/20 bg-cream text-foreground hover:border-foreground/40"
      }`}
    >
      {children}
    </button>
  );
}
