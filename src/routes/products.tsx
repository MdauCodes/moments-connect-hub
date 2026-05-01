import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { ConfiguratorModal } from "@/components/ConfiguratorModal";
import { Link } from "@tanstack/react-router";
import { api } from "@/services/api";
import { categories } from "@/data/products";
import type { Product, Industry } from "@/data/products";
import { getStockInfo } from "@/lib/stock";
import { MOCK_PRODUCTS } from "@/data/mockProducts";

/**
 * Smart loading state for the catalogue.
 * - "ok": real data (or fallback) is in `products`, render grid normally
 * - "fallback": API unreachable / 404 → showing MOCK_PRODUCTS + subtle banner
 * - "empty": API responded with [] and no filters active
 * - "unauthorized": 401/403
 * - "server_error": 500 / unknown — show retry
 */
type LoadState = "ok" | "fallback" | "empty" | "unauthorized" | "server_error";

/** Extract HTTP status from the api layer's `Error("API request failed: 404")`. */
function statusFromError(err: unknown): number | null {
  if (!(err instanceof Error)) return null;
  const m = /(\d{3})/.exec(err.message);
  return m ? Number(m[1]) : null;
}

function classifyError(err: unknown): Exclude<LoadState, "ok" | "empty"> {
  const status = statusFromError(err);
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404 || status === null) return "fallback"; // null = network/TypeError
  if (status >= 500) return "server_error";
  return "fallback";
}

const sortOptions = ["newest", "price-asc", "price-desc", "popular"] as const;
type SortKey = (typeof sortOptions)[number];

const searchSchema = z.object({
  category: z.string().optional(),
  industry: z.string().optional(),
  q: z.string().optional(),
  newArrivals: z.boolean().optional(),
  deals: z.boolean().optional(),
  fastMoving: z.boolean().optional(),
  inStock: z.boolean().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z.enum(sortOptions).optional(),
});

const PAGE_SIZE = 20;
const CATEGORY_OPTIONS = categories.map((c) => ({ value: c.slug, label: c.name }));
const ALL_PRICE_MAX = 500;

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
  const {
    category,
    industry: industrySlug,
    q,
    newArrivals,
    deals,
    fastMoving,
    inStock,
    minPrice,
    maxPrice,
    sort = "newest",
  } = search;

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
  const [loadState, setLoadState] = useState<LoadState>("ok");
  const [retryTick, setRetryTick] = useState(0);

  const selectedIndustry = useMemo(
    () => industries.find((i) => i.slug === industrySlug) ?? null,
    [industries, industrySlug],
  );

  const sortParam = useMemo(() => {
    switch (sort) {
      case "price-asc": return "basePrice,asc";
      case "price-desc": return "basePrice,desc";
      case "popular": return "monthlyClicks,desc";
      default: return "createdAt,desc";
    }
  }, [sort]);

  const anyFilterActive = !!(
    industrySlug || category || newArrivals || deals || fastMoving ||
    inStock || minPrice !== undefined || maxPrice !== undefined ||
    (q && q.length > 1)
  );

  // Industries
  useEffect(() => {
    let cancelled = false;
    void api.getIndustries().then((data) => {
      if (!cancelled) setIndustries(data);
    });
    return () => { cancelled = true; };
  }, []);

  // Reset on filter change
  useEffect(() => {
    setPage(0);
  }, [industrySlug, category, newArrivals, deals, fastMoving, inStock, minPrice, maxPrice, sort]);

  // Fetch
  useEffect(() => {
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
        sort: sortParam,
      })
      .then((data) => {
        if (cancelled) return;
        // Client-side post-filter for price + inStock (mock-friendly).
        let filtered = data;
        if (inStock) {
          filtered = filtered.filter(
            (p) => getStockInfo(p, null, 0).state !== "out_of_stock",
          );
        }
        if (minPrice !== undefined) {
          filtered = filtered.filter((p) => (p.basePrice ?? 0) >= minPrice);
        }
        if (maxPrice !== undefined && maxPrice < ALL_PRICE_MAX) {
          filtered = filtered.filter((p) => (p.basePrice ?? 0) <= maxPrice);
        }
        setHasMore(data.length === PAGE_SIZE);
        setProducts((prev) => (page === 0 ? filtered : [...prev, ...filtered]));
      })
      .catch(() => { if (!cancelled && page === 0) setProducts([]); })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
        setIsLoadingMore(false);
      });

    return () => { cancelled = true; };
  }, [selectedIndustry, category, newArrivals, deals, fastMoving, inStock, minPrice, maxPrice, sortParam, page, searchResults]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void navigate({ search: (prev) => ({ ...prev, q: query || undefined }) });
      if (query.trim().length < 2) { setSearchResults(null); return; }
      setIsLoading(true);
      void api
        .searchProducts(query.trim(), 12)
        .then((data) => setSearchResults(data))
        .catch(() => setSearchResults([]))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const setParam = <K extends keyof typeof search>(key: K, value: (typeof search)[K] | undefined) => {
    void navigate({ search: (prev) => ({ ...prev, [key]: value }) });
  };

  const toggleIndustry = (slug: string) => {
    void navigate({
      search: (prev) => ({ ...prev, industry: prev.industry === slug ? undefined : slug }),
    });
  };

  const toggle = (key: "newArrivals" | "deals" | "fastMoving" | "inStock") => {
    void navigate({ search: (prev) => ({ ...prev, [key]: prev[key] ? undefined : true }) });
  };

  const clearAll = () => {
    setQuery("");
    setSearchResults(null);
    void navigate({ search: () => ({}) });
  };

  const grid = searchResults ?? products;

  // JSON-LD ItemList for the visible page
  const itemListLd = useMemo(() => {
    if (!grid.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: grid.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://www.momentspackaging.com/products/${p.slug}`,
        name: p.name,
      })),
    };
  }, [grid]);

  // Active filter chips
  const chips: Array<{ label: string; clear: () => void }> = [];
  if (selectedIndustry) chips.push({ label: selectedIndustry.name, clear: () => setParam("industry", undefined) });
  if (category) {
    const cat = CATEGORY_OPTIONS.find((c) => c.value === category);
    chips.push({ label: cat?.label ?? category, clear: () => setParam("category", undefined) });
  }
  if (newArrivals) chips.push({ label: "New Arrivals", clear: () => setParam("newArrivals", undefined) });
  if (deals) chips.push({ label: "Deals", clear: () => setParam("deals", undefined) });
  if (fastMoving) chips.push({ label: "Fast Moving", clear: () => setParam("fastMoving", undefined) });
  if (inStock) chips.push({ label: "In stock only", clear: () => setParam("inStock", undefined) });
  if (minPrice !== undefined) chips.push({ label: `Min KES ${minPrice}`, clear: () => setParam("minPrice", undefined) });
  if (maxPrice !== undefined) chips.push({ label: `Max KES ${maxPrice}`, clear: () => setParam("maxPrice", undefined) });

  return (
    <SiteLayout>
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}

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
        {/* Search */}
        <div className="pt-6">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
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

          <ToggleChip active={!!newArrivals} onClick={() => toggle("newArrivals")}>New Arrivals</ToggleChip>
          <ToggleChip active={!!deals} onClick={() => toggle("deals")}>Deals</ToggleChip>
          <ToggleChip active={!!fastMoving} onClick={() => toggle("fastMoving")}>Fast Moving</ToggleChip>
          <ToggleChip active={!!inStock} onClick={() => toggle("inStock")}>In stock</ToggleChip>
        </div>

        {/* Refinement bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
            Category
            <select
              value={category ?? ""}
              onChange={(e) => setParam("category", e.target.value || undefined)}
              className="rounded-full border border-foreground/20 bg-background px-3 py-1.5 text-xs"
            >
              <option value="">All</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
            Sort
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value as SortKey)}
              className="rounded-full border border-foreground/20 bg-background px-3 py-1.5 text-xs"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="popular">Most popular</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
            Price (KES)
            <input
              type="number"
              min={0}
              placeholder="min"
              value={minPrice ?? ""}
              onChange={(e) => setParam("minPrice", e.target.value ? Number(e.target.value) : undefined)}
              className="w-20 rounded-full border border-foreground/20 bg-background px-3 py-1.5 text-xs"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="number"
              min={0}
              placeholder="max"
              value={maxPrice ?? ""}
              onChange={(e) => setParam("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
              className="w-20 rounded-full border border-foreground/20 bg-background px-3 py-1.5 text-xs"
            />
          </label>

          {anyFilterActive && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto whitespace-nowrap text-xs font-medium text-accent hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active chips */}
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={chip.clear}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

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
