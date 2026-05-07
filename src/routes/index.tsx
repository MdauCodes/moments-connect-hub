import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import {
  DotGrid,
  PaperTexture,
  ArcStroke,
  UnderlineStroke,
  CornerLines,
  SignatureDivider,
} from "@/components/BrandDecor";
import { LatestBlogsStrip } from "@/components/blog/LatestBlogsStrip";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { ConfiguratorModal } from "@/components/ConfiguratorModal";
import {
  ArrowRight,
  ShoppingCart,
  Smartphone,
  Truck,
  MapPin,
  Clock,
  ShoppingBag,
  Package,
  Coffee,
  Mail,
  Tag,
  Utensils,
  Gift,
  Sparkles,
  Check,
} from "lucide-react";
import { api } from "@/services/api";
import type { Product } from "@/data/products";
import { usePersona } from "@/contexts/PersonaContext";

// ── JSON-LD ───────────────────────────────────────────────────────────────────
const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Moments Packaging (K) Limited",
  url: "https://www.momentspackaging.com",
  logo: "https://www.momentspackaging.com/og-image.jpg",
  email: "sales@momentspackaging.co.ke",
  telephone: "+254119556688",
  address: {
    "@type": "PostalAddress",
    addressCountry: "KE",
    addressLocality: "Nairobi",
  },
  sameAs: [],
};

const siteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Moments Packaging (K) Limited",
  url: "https://www.momentspackaging.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.momentspackaging.com/products?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moments Packaging (K) Limited — Order Quality Paper Packaging Online | Nairobi" },
      {
        name: "description",
        content:
          "Order quality paper packaging online — bags, boxes, cups, mailers and gifting packaging. Same day delivery within Nairobi, upto 3 days countrywide. Pay with M-Pesa.",
      },
      { property: "og:title", content: "Moments Packaging (K) Limited — Quality Packaging Online" },
      {
        property: "og:description",
        content:
          "Quality packaging for Kenyan brands. Order online, pay with M-Pesa, delivered same day within Nairobi.",
      },
      { property: "og:image", content: "https://www.momentspackaging.com/og-image.jpg" },
      { name: "twitter:image", content: "https://www.momentspackaging.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.momentspackaging.com/" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(orgLd) },
      { type: "application/ld+json", children: JSON.stringify(siteLd) },
    ],
  }),
  component: HomePage,
});

// ── Hero pills — no MOQ, no "no sales calls" ──────────────────────────────────
const heroPills = [
  "M-Pesa checkout",
  "Same day Nairobi delivery",
  "Upto 3 days countrywide",
  "Branding available on order",
];

// ── Trust bar — updated delivery info ────────────────────────────────────────
const trustItems = [
  { icon: ShoppingCart, label: "Order online 24/7" },
  { icon: Smartphone, label: "M-Pesa accepted" },
  { icon: MapPin, label: "Same day — Nairobi" },
  { icon: Truck, label: "Upto 3 days countrywide" },
  { icon: Clock, label: "Branding available on order" },
];

// ── Category tiles — image-backed Swiss layout ────────────────────────────────
type CategoryTile = {
  label: string;
  image: string; // Unsplash fallback
  search: Record<string, string>;
};

const categoryTiles: CategoryTile[] = [
  {
    label: "Paper bags",
    image: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600&q=80",
    search: { category: "bags" },
  },
  {
    label: "Boxes & cartons",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80",
    search: { category: "boxes" },
  },
  {
    label: "Cups & sleeves",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
    search: { category: "cups" },
  },
  {
    label: "Mailers & pouches",
    image: "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&q=80",
    search: { category: "mailers" },
  },
  {
    label: "Labels & stickers",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80",
    search: { category: "labels" },
  },
  {
    label: "Food containers",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
    search: { category: "boxes" },
  },
  {
    label: "Gift & event",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
    search: { category: "gifting" },
  },
  {
    label: "Beauty & pharma",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
    search: { category: "gifting" },
  },
];

// ── Persona segments ──────────────────────────────────────────────────────────
const personaSegments = [
  { id: "individual" as const, label: "I'm an individual", blurb: "Wedding, birthday, gifting — order what you need." },
  { id: "sme" as const, label: "Small business / shop", blurb: "Restaurant, café, retail — fast turnaround." },
  { id: "corporate" as const, label: "Large company / brand", blurb: "Volume orders, contracts, formal quotes." },
];

// ── Featured products ─────────────────────────────────────────────────────────
function FeaturedProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [configuring, setConfiguring] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getRecommended()
      .then((data) => {
        if (!cancelled) setProducts(data.slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Featured products</p>
            <h2 className="mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">Popular this week</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
          >
            Browse all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {products === null ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : products.length === 0 ? (
            <div className="col-span-4 py-12 text-center text-sm text-muted-foreground">
              Products loading — check back shortly.
            </div>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} onConfigure={setConfiguring} />)
          )}
        </div>

        <ConfiguratorModal product={configuring} onClose={() => setConfiguring(null)} />
      </div>
    </section>
  );
}

// ── Category grid — Swiss image tiles ────────────────────────────────────────
function CategoryGrid() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <PaperTexture opacity={0.06} />
      <CornerLines className="left-4 top-4" opacity={0.1} />
      <CornerLines className="bottom-4 right-4 rotate-180" opacity={0.1} />
      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
        <SignatureDivider className="mb-10" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Browse</p>
            <h2 className="mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">Shop by category</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
          >
            See everything <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-4">
          {categoryTiles.map((tile) => (
            <Link
              key={tile.label}
              to="/products"
              search={tile.search as never}
              className="group relative overflow-hidden rounded-2xl aspect-square sm:aspect-[4/3] block"
            >
              {/* Background image */}
              <img
                src={tile.image}
                alt={tile.label}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Label */}
              <span className="absolute bottom-3 left-3 right-3 font-display text-sm font-semibold text-white sm:text-base">
                {tile.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Persona picker ────────────────────────────────────────────────────────────
function PersonaSegmentPicker() {
  const { persona, setPersona } = usePersona();
  return (
    <section className="relative overflow-hidden bg-cream">
      <DotGrid opacity={0.04} size={14} />
      <ArcStroke className="-right-32 top-1/2 h-80 w-80 -translate-y-1/2" color="kraft" opacity={0.06} />
      <div className="relative mx-auto max-w-5xl px-5 py-14 text-center sm:py-16 lg:px-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Optional</p>
        <h2 className="mt-2 font-display text-2xl font-medium text-foreground sm:text-3xl">
          Who are you ordering for?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Pick one to tailor recommendations. Skip if you&apos;d rather just browse.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {personaSegments.map((seg) => {
            const active = persona === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => setPersona(active ? null : seg.id)}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border bg-background text-foreground hover:border-foreground/40 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-semibold">{seg.label}</span>
                  {active && <Check className="h-4 w-4" />}
                </div>
                <p className={`mt-2 text-xs ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {seg.blurb}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Home page ─────────────────────────────────────────────────────────────────
function HomePage() {
  const trustList = useMemo(() => trustItems, []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cream">
        <DotGrid opacity={0.05} size={14} />
        <ArcStroke className="-left-48 -top-48 h-[36rem] w-[36rem]" opacity={0.06} />
        <ArcStroke className="-bottom-56 -right-48 h-[40rem] w-[40rem]" color="clay" opacity={0.05} />
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:py-20 lg:px-8 lg:py-28">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Quality packaging · Nairobi, Kenya</p>
          <h1 className="mt-3 font-display text-[2.25rem] font-medium leading-[1.08] text-foreground text-balance sm:text-5xl lg:text-[3.5rem]">
            Quality Packaging for{" "}
            <span className="relative inline-block">
              <em className="not-italic text-accent">Kenyan Businesses</em>
              <UnderlineStroke />
            </span>
          </h1>
          {/* Updated subtitle — no MOQ, no "no sales calls" */}
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Order quality packaging online — bags, boxes, cups and more. Delivered same day within Nairobi, upto 3 days
            countrywide.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {heroPills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-kraft/40 bg-background/70 px-3 py-1 text-xs font-medium text-foreground/80"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 hover:shadow-xl"
            >
              Browse all packaging <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/enterprise-quote"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/30 bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Enterprise quote
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Shop by use:</span>
            {[
              { label: "Café & restaurant", search: { category: "cups" } },
              { label: "Retail & e-commerce", search: { category: "bags" } },
              { label: "Events & gifting", search: { category: "gifting" } },
            ].map((chip) => (
              <Link
                key={chip.label}
                to="/products"
                search={chip.search as never}
                className="rounded-full border border-foreground/15 bg-background/60 px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-accent hover:text-accent"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
          <ul className="grid grid-cols-2 gap-y-3 text-xs font-medium sm:flex sm:items-center sm:justify-between sm:gap-2 sm:text-sm">
            {trustList.map((t, i) => (
              <li
                key={t.label}
                className={`flex items-center justify-center gap-2 sm:flex-1 ${
                  i > 0 ? "sm:border-l sm:border-primary-foreground/20" : ""
                }`}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                <span className="text-center">{t.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CATEGORY GRID — Swiss image tiles */}
      <CategoryGrid />

      {/* FEATURED PRODUCTS */}
      <FeaturedProducts />

      {/* PERSONA PICKER */}
      <PersonaSegmentPicker />

      {/* BLOGS */}
      <LatestBlogsStrip />
    </SiteLayout>
  );
}
