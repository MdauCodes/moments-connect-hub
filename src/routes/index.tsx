import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PageProgressBar } from "@/components/PageProgressBar";
import { EmailInsiderPrompt } from "@/components/EmailInsiderPrompt";
import { AppSplash } from "@/components/AppSplash";
import { LatestBlogsStrip } from "@/components/blog/LatestBlogsStrip";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { ConfiguratorModal } from "@/components/ConfiguratorModal";
import {
  ArrowRight,
  Search,
  ShoppingBag,
  Menu,
  X,
  Tag,
  Briefcase,
  MessageCircle,
  Coffee,
  Package,
  Gift,
  ChevronRight,
} from "lucide-react";
import { Check } from "lucide-react";
import {
  DotGrid,
  PaperTexture,
  ArcStroke,
  CornerLines,
  SignatureDivider,
} from "@/components/BrandDecor";
import { api } from "@/services/api";
import type { Product } from "@/data/products";
import cloudV3 from "@/assets/packaging-cloud-hero-v3.png";
import cloudKraft from "@/assets/packaging-cloud-hero.png";

const SPLASH_KEY = "moments_splash_shown";

const siteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Moments Packaging (K) Limited",
  url: "https://momentspackaging.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://momentspackaging.com/products?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moments Packaging Kenya — Order Paper Packaging Online" },
      {
        name: "description",
        content:
          "Order quality paper packaging online — bags, boxes, cups, mailers and gifting. Same-day Nairobi delivery, M-Pesa checkout.",
      },
      { property: "og:title", content: "Moments Packaging Kenya — Quality Packaging Online" },
      {
        property: "og:description",
        content:
          "Quality packaging for Kenyan brands. Order online, pay with M-Pesa, same-day Nairobi delivery.",
      },
      { property: "og:url", content: "https://momentspackaging.com/" },
      { property: "og:image", content: "https://momentspackaging.com/og-image.jpg" },
      { name: "twitter:image", content: "https://momentspackaging.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://momentspackaging.com/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(siteLd) }],
  }),
  component: HomePage,
});

const ANNOUNCE_ITEMS = [
  "Order online 24/7",
  "M-Pesa accepted",
  "Same day — Nairobi",
  "Up to 3 days countrywide",
  "Branding available on order",
];

const TRUST_STATS = [
  { num: "500+", label: "Kenyan businesses served" },
  { num: "Same day", label: "Nairobi delivery" },
  { num: "No min.", label: "Order any quantity" },
  { num: "24/7", label: "Order anytime" },
  { num: "M-Pesa", label: "Accepted at checkout", desktopOnly: true },
];

const CATEGORIES = [
  { name: "Café & restaurant", desc: "Cups, boxes, sleeves", Icon: Coffee, search: { category: "cups" } },
  { name: "Retail & e-commerce", desc: "Mailers, carrier bags", Icon: Package, search: { category: "bags" } },
  { name: "Events & gifting", desc: "Gift boxes, wrapping", Icon: Gift, search: { category: "gifting" } },
  { name: "Enterprise", desc: "10,000+ unit runs", Icon: Briefcase, search: { category: "boxes" } },
];

// ── First-visit splash ──
function FirstVisitSplash() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SPLASH_KEY)) return;
    sessionStorage.setItem(SPLASH_KEY, "1");
    setShow(true);
  }, []);
  if (!show) return null;
  return <AppSplash />;
}

// ── Mobile floating action button ──
function MobileFab() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const el = document.getElementById("mpk-fab-root");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const items = [
    { label: "WhatsApp", Icon: MessageCircle, href: "https://wa.me/254700000000", iconClass: "text-forest" },
    { label: "Enterprise", Icon: Briefcase, to: "/enterprise-quote", iconClass: "text-ink" },
    { label: "Deals", Icon: Tag, to: "/products", iconClass: "text-accent" },
    { label: "Shop", Icon: ShoppingBag, to: "/products", iconClass: "text-ink" },
  ];

  return (
    <div
      id="mpk-fab-root"
      className="md:hidden absolute right-[18px] bottom-6 flex flex-col items-end"
      style={{ zIndex: 10 }}
    >
      {open && (
        <div
          className="mb-2 flex flex-col items-end gap-2 rounded-2xl p-2"
          style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.18)" }}
        >
          {items.map((it) => {
            const pill = (
              <span className="rounded-full bg-[color:var(--ink)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                {it.label}
              </span>
            );
            const icon = (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-md">
                <it.Icon className={`h-4 w-4 ${it.iconClass}`} strokeWidth={1.8} style={it.label === "Deals" ? { color: "var(--accent)" } : it.label === "WhatsApp" ? { color: "var(--forest)" } : { color: "var(--ink)" }} />
              </span>
            );
            return it.to ? (
              <Link key={it.label} to={it.to} className="flex items-center gap-2" onClick={() => setOpen(false)}>
                {pill}
                {icon}
              </Link>
            ) : (
              <a key={it.label} href={it.href} target="_blank" rel="noreferrer" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                {pill}
                {icon}
              </a>
            );
          })}
        </div>
      )}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-full text-white shadow-lg"
        style={{ background: "var(--accent)" }}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </div>
  );
}

// ── Hero with overlay nav + announcement ──
function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "var(--ink)",
        minHeight: "520px",
      }}
    >
      <style>{`
        @keyframes mpk-hero-a { 0%,40% { opacity: 1; } 50%,90% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes mpk-hero-b { 0%,40% { opacity: 0; } 50%,90% { opacity: 1; } 100% { opacity: 0; } }
        .mpk-hero-img-a { animation: mpk-hero-a 14s ease-in-out infinite; }
        .mpk-hero-img-b { animation: mpk-hero-b 14s ease-in-out infinite; }
        @keyframes mpk-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .mpk-marquee-track { animation: mpk-marquee 18s linear infinite; }
        @media (max-width: 767px) {
          .mpk-hero-section { min-height: 480px !important; }
        }
      `}</style>

      <div className="mpk-hero-section relative" style={{ minHeight: "520px" }}>
        {/* Crossfading hero images */}
        <img
          src={cloudV3}
          alt="A diverse cluster of branded paper packaging — bags, boxes, cups and more"
          className="mpk-hero-img-a absolute pointer-events-none select-none"
          style={{
            zIndex: 1,
            transition: "opacity 1.5s ease-in-out",
            filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.5))",
            objectFit: "contain",
            opacity: 1,
          }}
        />
        <img
          src={cloudKraft}
          alt="A cluster of kraft paper packaging — bags, boxes, cups"
          className="mpk-hero-img-b absolute pointer-events-none select-none"
          style={{
            zIndex: 1,
            transition: "opacity 1.5s ease-in-out",
            filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.5))",
            objectFit: "contain",
            opacity: 0,
          }}
        />

        {/* Responsive image positioning — scaled down, right-centered, never overflows section */}
        <style>{`
          .mpk-hero-img-a, .mpk-hero-img-b {
            right: -22%;
            top: 58%;
            transform: translateY(-50%);
            width: 88%;
            max-height: 70%;
            opacity: 0.55;
          }
          @media (min-width: 768px) {
            .mpk-hero-img-a, .mpk-hero-img-b {
              right: 2%;
              top: 50%;
              transform: translateY(-50%);
              width: 44%;
              max-height: 82%;
              opacity: 1;
            }
          }
          .mpk-hero-img-b { opacity: 0 !important; }
          @media (min-width: 768px) {
            .mpk-hero-img-a { opacity: 1; }
          }
        `}</style>

        {/* Gradient scrim */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 3,
            background:
              "linear-gradient(100deg, rgba(26,14,8,0.92) 0%, rgba(26,14,8,0.80) 30%, rgba(26,14,8,0.28) 60%, rgba(26,14,8,0.0) 76%)",
          }}
        />

        {/* Navigation */}
        <nav
          className="absolute left-0 right-0 top-0"
          style={{
            zIndex: 30,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
            <Link to="/" className="font-display text-xl font-semibold text-white tracking-tight">
              Moments
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
              <Link to="/products" className="hover:opacity-80">Shop</Link>
              <Link to="/products" search={{ deals: true } as never} style={{ color: "var(--accent)" }} className="hover:opacity-80">Deals</Link>
              <Link to="/enterprise-quote" className="hover:opacity-80">Enterprise</Link>
            </div>
            <div className="flex items-center gap-4 text-white">
              <button aria-label="Search" className="hover:opacity-80">
                <Search className="h-5 w-5" />
              </button>
              <Link to="/cart" aria-label="Cart" className="relative hover:opacity-80">
                <ShoppingBag className="h-5 w-5" />
                <span
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              </Link>
              <Link to="/login" className="hidden md:inline text-sm hover:opacity-80">Sign in</Link>
            </div>
          </div>
        </nav>

        {/* Announcement bar */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "62px",
            zIndex: 20,
            background: "color-mix(in oklab, var(--forest) 88%, transparent)",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Desktop row */}
          <div
            className="hidden md:flex items-center justify-center overflow-hidden whitespace-nowrap"
            style={{ gap: "32px", padding: "7px 40px" }}
          >
            {ANNOUNCE_ITEMS.map((item, i) => (
              <span key={item} className="flex items-center" style={{ gap: "32px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.88)" }}>{item}</span>
                {i < ANNOUNCE_ITEMS.length - 1 && (
                  <span
                    className="inline-block h-1 w-1 rounded-full"
                    style={{ background: "color-mix(in oklab, var(--forest) 40%, white)" }}
                  />
                )}
              </span>
            ))}
          </div>
          {/* Mobile marquee */}
          <div className="md:hidden overflow-hidden" style={{ padding: "7px 0" }}>
            <div className="mpk-marquee-track flex" style={{ gap: "24px", width: "max-content", whiteSpace: "nowrap" }}>
              {[...ANNOUNCE_ITEMS, ...ANNOUNCE_ITEMS].map((item, idx) => (
                <span key={`${item}-${idx}`} className="flex items-center" style={{ gap: "24px" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.88)" }}>{item}</span>
                  <span
                    className="inline-block h-1 w-1 rounded-full"
                    style={{ background: "color-mix(in oklab, var(--forest) 40%, white)" }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hero text content */}
        <div
          className="absolute md:top-1/2 md:-translate-y-1/2 md:left-10 md:w-[48%]"
          style={{ zIndex: 4 }}
        >
          <div
            className="px-5 md:px-0"
            style={{ paddingTop: "100px" }}
          >
            <p
              className="uppercase font-medium"
              style={{
                fontSize: "10px",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.52)",
                marginBottom: "16px",
              }}
            >
              QUALITY PACKAGING · NAIROBI, KENYA
            </p>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(34px, 5vw, 52px)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "white",
                fontWeight: 500,
              }}
            >
              Packaging for<br />
              Kenyan brands —<br />
              <em className="italic" style={{ color: "var(--accent)" }}>unforgettable.</em>
            </h1>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.68)",
                maxWidth: "380px",
                margin: "20px 0 28px",
              }}
            >
              Bags, boxes, cups and more — order online, pay with M-Pesa. Delivered same day within Nairobi, up to 3 days countrywide.
            </p>
            <div className="flex flex-col md:flex-row gap-3 max-w-sm md:max-w-none">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 font-semibold text-white"
                style={{
                  background: "var(--accent)",
                  borderRadius: "10px",
                  padding: "13px 26px",
                  fontSize: "14px",
                }}
              >
                Browse all packaging <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/enterprise-quote"
                className="inline-flex items-center justify-center text-white font-medium"
                style={{
                  background: "rgba(255,255,255,0.09)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "10px",
                  padding: "13px 26px",
                  fontSize: "14px",
                }}
              >
                Enterprise quote
              </Link>
            </div>
            <div
              className="inline-flex items-center"
              style={{
                marginTop: "20px",
                gap: "8px",
                background: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(141,201,106,0.28)",
                backdropFilter: "blur(8px)",
                borderRadius: "8px",
                padding: "8px 14px",
              }}
            >
              <span
                className="inline-block rounded-full"
                style={{ width: "6px", height: "6px", background: "#00A651" }}
              />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.82)" }}>
                M-Pesa accepted at checkout
              </span>
            </div>
          </div>
        </div>

        {/* Wave SVG */}
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="absolute left-0 right-0"
          style={{ bottom: "-1px", zIndex: 5, width: "100%", height: "60px" }}
          aria-hidden
        >
          <path d="M0 60 L0 35 Q360 5 720 30 Q1080 55 1440 22 L1440 60 Z" fill="var(--ink)" />
        </svg>

        <MobileFab />
      </div>
    </section>
  );
}

// ── Trust bar ──
function TrustBar() {
  return (
    <section style={{ background: "var(--ink)" }}>
      {/* Desktop row */}
      <div
        className="hidden md:flex max-w-7xl mx-auto"
        style={{ justifyContent: "space-around", padding: "20px 40px" }}
      >
        {TRUST_STATS.map((s, i) => (
          <div
            key={s.num + s.label}
            className="text-center flex-1"
            style={{ borderRight: i < TRUST_STATS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}
          >
            <div className="font-display" style={{ fontSize: "22px", color: "var(--accent)" }}>
              {s.num}
            </div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
      {/* Mobile grid */}
      <div className="md:hidden grid grid-cols-2">
        {TRUST_STATS.filter((s) => !s.desktopOnly).map((s, i, arr) => (
          <div
            key={s.num + s.label}
            className="text-center"
            style={{
              padding: "16px 8px",
              borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
              borderBottom: i < arr.length - 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            <div className="font-display" style={{ fontSize: "17px", color: "var(--accent)" }}>
              {s.num}
            </div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Category row ──
function CategoryRow() {
  return (
    <section style={{ background: "var(--cream)" }}>
      <div className="max-w-7xl mx-auto md:grid md:grid-cols-4 flex flex-col">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.name}
            to="/products"
            search={c.search as never}
            className="flex items-center"
            style={{
              padding: "14px 20px",
              gap: "12px",
              borderRight: i < CATEGORIES.length - 1 ? "1px solid color-mix(in oklab, var(--ink) 8%, transparent)" : "none",
              borderBottom: i < CATEGORIES.length - 1 ? "1px solid color-mix(in oklab, var(--ink) 8%, transparent)" : "none",
            }}
          >
            <span
              className="grid place-items-center"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                background: "color-mix(in oklab, var(--accent) 10%, transparent)",
              }}
            >
              <c.Icon style={{ color: "var(--accent)" }} strokeWidth={1.7} className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block" style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink)" }}>
                {c.name}
              </span>
              <span className="block" style={{ fontSize: "10.5px", color: "color-mix(in oklab, var(--ink) 55%, transparent)" }}>
                {c.desc}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 ml-auto" style={{ color: "var(--accent)" }} />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Featured products (preserved from previous version) ──
function FeaturedProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [configuring, setConfiguring] = useState<Product | null>(null);
  const [preTier, setPreTier] = useState<string | null>(null);
  const handleConfigure = (p: Product, tierId?: string) => {
    setPreTier(tierId ?? null);
    setConfiguring(p);
  };

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

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products === null ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : products.length === 0 ? (
            <div className="col-span-4 py-12 text-center text-sm text-muted-foreground">
              Products loading — check back shortly.
            </div>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} onConfigure={handleConfigure} />)
          )}
        </div>

        <ConfiguratorModal product={configuring} preSelectedTierId={preTier} onClose={() => setConfiguring(null)} />
      </div>
    </section>
  );
}

// ── Category image grid (preserved from previous version) ──
type CategoryTile = { label: string; image: string; search: Record<string, string> };
const categoryTiles: CategoryTile[] = [
  { label: "Paper bags", image: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600&q=80", search: { category: "bags" } },
  { label: "Boxes & cartons", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80", search: { category: "boxes" } },
  { label: "Cups & sleeves", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80", search: { category: "cups" } },
  { label: "Mailers & pouches", image: "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&q=80", search: { category: "mailers" } },
  { label: "Labels & stickers", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80", search: { category: "labels" } },
  { label: "Food containers", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", search: { category: "boxes" } },
  { label: "Gift & event", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80", search: { category: "gifting" } },
  { label: "Beauty & pharma", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80", search: { category: "gifting" } },
];

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
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent">
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
              <img src={tile.image} alt={tile.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
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

// ── Audiences we serve (preserved) ──
const audienceColumns = [
  { Icon: Gift, role: "Individuals", blurb: "Weddings, birthdays, anniversaries and personal gifting — order what you need, no minimums.", examples: ["Wedding favours", "Birthday gift boxes", "One-off event packs"] },
  { Icon: ShoppingBag, role: "Small businesses & shops", blurb: "Cafés, restaurants, retail and online sellers — quality packaging on a turnaround that fits your week.", examples: ["Takeaway cups & boxes", "Branded carrier bags", "E-commerce mailers"] },
  { Icon: Package, role: "Companies & enterprise", blurb: "Volume orders, contracts and procurement — formal quotes and a dedicated contact for every rollout.", examples: ["10,000+ unit runs", "National brand rollouts", "Scheduled deliveries"] },
];

function AudiencesWeServe() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <DotGrid opacity={0.04} size={14} />
      <ArcStroke className="-right-32 top-1/2 h-80 w-80 -translate-y-1/2" color="kraft" opacity={0.06} />
      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Who we pack for</p>
          <h2 className="mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">
            Whether you&apos;re an individual, a small business, or a large enterprise — we serve all of you.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            One catalogue, one production line, three kinds of customers. Same quality, same craft — scaled to whatever you&apos;re ordering.
          </p>
        </div>

        <div className="mt-10 grid gap-8 border-t border-border pt-10 sm:grid-cols-3 sm:gap-6">
          {audienceColumns.map((col) => (
            <div key={col.role} className="flex flex-col">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <col.Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{col.role}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{col.blurb}</p>
              <ul className="mt-4 space-y-1.5 border-t border-border/60 pt-4">
                {col.examples.map((ex) => (
                  <li key={ex} className="flex items-start gap-2 text-xs text-foreground/75">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page ──
function HomePage() {
  return (
    <>
      <FirstVisitSplash />
      <PageProgressBar />
      <div className="flex min-h-screen flex-col" style={{ background: "var(--background)" }}>
        <main className="flex-1">
          <Hero />
          <TrustBar />
          <CategoryRow />
          <FeaturedProducts />
          <CategoryGrid />
          <AudiencesWeServe />
          <LatestBlogsStrip />
        </main>
        <SiteFooter />
        <WhatsAppFloat />
        <EmailInsiderPrompt />
      </div>
    </>
  );
}
