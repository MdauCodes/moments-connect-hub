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
  Clock,
  Pencil,
  ShoppingBag,
  Package,
  Coffee,
  Mail,
  Tag,
  Utensils,
  Gift,
  Sparkles,
  Plus,
  Check,
} from "lucide-react";
import { api } from "@/services/api";
import type { Product } from "@/data/products";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { useCart } from "@/contexts/CartContext";
import { usePersona } from "@/contexts/PersonaContext";
import { toast } from "sonner";

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Moments Packaging",
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
  name: "Moments Packaging",
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
      { title: "Moments Packaging Kenya — Shop Custom Branded Paper Packaging Online" },
      {
        name: "description",
        content:
          "Browse, configure and order branded paper packaging online. Bags, boxes, cups, mailers and gifting packaging delivered across Kenya from 100 units.",
      },
      { property: "og:title", content: "Moments Packaging Kenya — Shop Custom Packaging Online" },
      {
        property: "og:description",
        content:
          "Self-serve custom packaging for Kenyan brands. Configure online, pay with M-Pesa, delivered nationwide.",
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

const heroPills = [
  "100 MOQ",
  "M-Pesa checkout",
  "7–14 day delivery",
  "Kenya-wide",
];

const trustItems = [
  { icon: ShoppingCart, label: "Order online 24/7" },
  { icon: Smartphone, label: "M-Pesa accepted" },
  { icon: Truck, label: "Kenya-wide delivery" },
  { icon: Clock, label: "Production in 24 hrs" },
  { icon: Pencil, label: "Custom branding on every unit" },
];

/**
 * Visual category tiles for the homepage. These map to existing /products
 * filters via the `search` param so we don't touch routing logic.
 */
type CategoryTile = {
  label: string;
  icon: typeof ShoppingBag;
  count: string;
  search: Record<string, string>;
};

const categoryTiles: CategoryTile[] = [
  { label: "Paper bags",        icon: ShoppingBag, count: "32 products", search: { category: "bags" } },
  { label: "Boxes & cartons",   icon: Package,     count: "48 products", search: { category: "boxes" } },
  { label: "Cups & sleeves",    icon: Coffee,      count: "21 products", search: { category: "cups" } },
  { label: "Mailers & pouches", icon: Mail,        count: "18 products", search: { category: "mailers" } },
  { label: "Labels & stickers", icon: Tag,         count: "26 products", search: { category: "labels" } },
  { label: "Food containers",   icon: Utensils,    count: "29 products", search: { category: "boxes" } },
  { label: "Gift & event",      icon: Gift,        count: "17 products", search: { category: "gifting" } },
  { label: "Beauty & pharma",   icon: Sparkles,    count: "14 products", search: { category: "gifting" } },
];

const personaSegments = [
  { id: "individual" as const, label: "I'm an individual",   blurb: "Wedding, birthday, gifting — no minimums, no hassle." },
  { id: "sme"        as const, label: "Small business / shop", blurb: "Restaurant, café, retail — fast turnaround." },
  { id: "corporate"  as const, label: "Large company / brand", blurb: "Volume orders, contracts, formal quotes." },
];

function priceFmt(n: number) {
  return `KSh ${n.toLocaleString("en-KE")}`;
}

/** Compact product tile used inside the hero (right column). */
function HeroProductTile({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const price = product.basePrice ?? 0;
  const image = product.primaryImageUrl ?? product.image;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      productName: product.name,
      primaryImageUrl: image,
      size: product.sizes[0] ?? "Standard",
      material: product.materials?.[0] ?? "Kraft",
      finish: product.finish ?? "Matte",
      quantity: product.moq || 100,
      unitPrice: price,
    });
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {product.name}
        </h3>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-base text-foreground">{priceFmt(price)}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            MOQ {product.moq}
          </span>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className={`mt-1 inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            added
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          }`}
        >
          {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {added ? "Added" : "Add to cart"}
        </button>
      </div>
    </Link>
  );
}

function HeroProductsGrid({ products }: { products: Product[] | null }) {
  if (products === null) {
    return (
      <div className="ml-auto grid w-full max-w-md grid-cols-2 gap-2.5 sm:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-secondary/60" />
        ))}
      </div>
    );
  }
  return (
    <div className="ml-auto grid w-full max-w-md grid-cols-2 gap-2.5 sm:gap-3">
      {products.slice(0, 4).map((p) => (
        <HeroProductTile key={p.id} product={p} />
      ))}
    </div>
  );
}

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
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Featured products</p>
            <h2 className="mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Popular this week
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
          >
            Browse all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {products === null
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => (
                <ProductCard key={p.id} product={p} onConfigure={setConfiguring} />
              ))}
        </div>

        <ConfiguratorModal product={configuring} onClose={() => setConfiguring(null)} />
      </div>
    </section>
  );
}

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

function HomePage() {
  const [heroProducts, setHeroProducts] = useState<Product[] | null>(null);

  // Same data source as Featured — falls back to mock catalogue on failure.
  useEffect(() => {
    let cancelled = false;
    api
      .getRecommended()
      .then((data) => {
        if (cancelled) return;
        setHeroProducts(data.length ? data.slice(0, 4) : MOCK_PRODUCTS.slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setHeroProducts(MOCK_PRODUCTS.slice(0, 4));
      });
    return () => { cancelled = true; };
  }, []);

  const trustList = useMemo(() => trustItems, []);

  return (
    <SiteLayout>
      {/* HERO — two-column: left CTA + right 2x2 product grid */}
      <section className="relative overflow-hidden bg-cream">
        <DotGrid opacity={0.05} size={14} />
        <ArcStroke className="-left-48 -top-48 h-[36rem] w-[36rem]" opacity={0.06} />
        <ArcStroke
          className="-bottom-56 -right-48 h-[40rem] w-[40rem]"
          color="clay"
          opacity={0.05}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">
              Premium paper packaging
            </p>
            <h1 className="mt-3 font-display text-[2.5rem] font-medium leading-[1.05] text-foreground text-balance sm:text-5xl lg:text-[3.5rem]">
              Packaging that <br />
              makes the{" "}
              <span className="relative inline-block">
                <em className="not-italic text-accent">moment</em>
                <UnderlineStroke />
              </span>
              .
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Browse, configure and order branded paper packaging online. Delivered across Kenya from 100 units.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {heroPills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-kraft/40 bg-background/70 px-3 py-1 text-xs font-medium text-foreground/80"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 hover:shadow-xl"
              >
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/enterprise-quote"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/30 bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Enterprise quote
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <CornerLines className="-right-2 -top-2 rotate-180" opacity={0.12} />
            <CornerLines className="-bottom-2 -left-2" opacity={0.12} />
            <HeroProductsGrid products={heroProducts} />
          </div>
        </div>
      </section>

      {/* TRUST BAR — dark green strip with 5 items */}
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

      {/* SHOP BY CATEGORY — 4x2 grid on cream */}
      <section className="relative overflow-hidden bg-cream">
        <PaperTexture opacity={0.06} />
        <CornerLines className="left-4 top-4" opacity={0.1} />
        <CornerLines className="bottom-4 right-4 rotate-180" opacity={0.1} />
        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
          <SignatureDivider className="mb-10" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Browse</p>
              <h2 className="mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">
                Shop by category
              </h2>
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
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <tile.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base text-foreground">{tile.label}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{tile.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS — white background, 4-column grid */}
      <FeaturedProducts />

      {/* OPTIONAL PERSONA PICKER — moved here, no longer a blocking gate */}
      <PersonaSegmentPicker />

      {/* BLOGS */}
      <LatestBlogsStrip />
    </SiteLayout>
  );
}
