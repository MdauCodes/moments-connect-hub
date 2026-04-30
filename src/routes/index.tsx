import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PackagingCloud } from "@/components/PackagingCloud";
import { IndustriesStrip } from "@/components/IndustriesStrip";
import { LatestBlogsStrip } from "@/components/blog/LatestBlogsStrip";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { ConfiguratorModal } from "@/components/ConfiguratorModal";
import { ArrowRight, ShoppingCart, Smartphone, Truck, Pencil, Grid, Phone, Truck as TruckIcon } from "lucide-react";
import { api } from "@/services/api";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moments Packaging Kenya — Custom Branded Paper Packaging | Nairobi" },
      {
        name: "description",
        content:
          "Browse, configure and order branded paper packaging online. Bags, boxes, cups, mailers and gifting packaging delivered across Kenya from 100 units.",
      },
      { property: "og:title", content: "Moments Packaging Kenya — Order Custom Packaging Online" },
      {
        property: "og:description",
        content:
          "Self-serve custom packaging for Kenyan brands. Configure online, pay with M-Pesa, delivered nationwide.",
      },
      { property: "og:image", content: "https://www.momentspackaging.com/og-image.jpg" },
      { name: "twitter:image", content: "https://www.momentspackaging.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.momentspackaging.com/" }],
  }),
  component: HomePage,
});

const trustItems = [
  { icon: ShoppingCart, label: "Order online 24/7" },
  { icon: Smartphone, label: "M-Pesa accepted" },
  { icon: Truck, label: "Kenya-wide delivery" },
  { icon: Pencil, label: "Custom branding" },
];

const howSteps = [
  {
    n: "01",
    icon: Grid,
    title: "Browse & configure",
    body: "Choose your product, size, material and quantity online.",
  },
  {
    n: "02",
    icon: Phone,
    title: "Pay with M-Pesa",
    body: "Get an instant payment prompt on your phone. No forms, no waiting.",
  },
  {
    n: "03",
    icon: TruckIcon,
    title: "We produce & deliver",
    body: "Production starts within 24 hours. Delivered across Kenya in 7–14 days.",
  },
];

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const navigate = useNavigate();
  const { addItem } = useCart();

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

  const trackClick = (id: string) => {
    fetch(apiUrl(`/api/v1/public/products/${encodeURIComponent(id)}/click`), {
      method: "POST",
    }).catch(() => {
      /* fire and forget */
    });
  };

  const handleCardClick = (p: Product) => {
    trackClick(p.id);
    navigate({ to: "/products/$slug", params: { slug: p.slug } });
  };

  const handleAddToCart = (p: Product) => {
    // Configurator modal coming in Prompt 2 — for now use sensible defaults
    addItem({
      productId: p.id,
      productName: p.name,
      primaryImageUrl: p.image,
      size: p.sizes?.[0] ?? "Medium",
      material: "Standard",
      finish: "Standard",
      quantity: p.moq,
      unitPrice: 0,
    });
    toast.success(`${p.name} added to cart`);
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Curated highlights</p>
          <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
            Picks of the moment
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
              <article
                key={p.id}
                onClick={() => handleCardClick(p)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="self-start rounded-full border border-kraft/30 bg-kraft/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-kraft">
                    {p.category}
                  </span>
                  <h3 className="mt-2 font-display text-base font-semibold text-foreground">
                    {p.name}
                  </h3>
                  {(p as Product & { basePrice?: number }).basePrice ? (
                    <p className="mt-1 text-sm text-primary">
                      From KES {(p as Product & { basePrice?: number }).basePrice!.toLocaleString()} per unit
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-primary">Pricing on configure</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Min. {p.moq.toLocaleString()} units
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(p);
                    }}
                    className="mt-3 w-full rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                  >
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cream lg:h-[78vh] lg:max-h-[680px] lg:min-h-[540px]">
        <div className="grain absolute inset-0 opacity-60" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-40 lg:hidden"
          aria-hidden
        >
          <div className="h-[120%] w-[120%] max-w-none">
            <PackagingCloud />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-1/2 lg:block">
          <div className="relative h-full w-full">
            <PackagingCloud />
          </div>
        </div>

        <div className="relative z-10 mx-auto grid h-full max-w-7xl items-center gap-8 px-5 pt-8 pb-10 sm:pt-10 sm:pb-12 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-0">
          <div className="lg:col-span-6">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">
              Premium paper packaging
            </p>
            <h1 className="mt-3 font-display text-[2.25rem] font-medium leading-[1.05] text-foreground text-balance sm:text-5xl lg:text-[3.5rem]">
              Packaging that <br />
              makes the <em className="not-italic text-accent">moment</em>.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Browse, configure, and order branded paper packaging online. Delivered across Kenya. Starting from 100 units.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["100 MOQ", "7–14 day lead time", "500+ brands packed"].map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-kraft/40 bg-background/60 px-3 py-1 text-xs font-medium text-foreground/80"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Shop packaging <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/enterprise-quote"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/30 bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Enterprise quote
              </Link>
            </div>
          </div>
          <div className="hidden lg:col-span-6 lg:block" aria-hidden />
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
          <ul className="grid grid-cols-2 gap-y-3 text-sm font-medium sm:flex sm:items-center sm:justify-between sm:gap-2">
            {trustItems.map((t, i) => (
              <li
                key={t.label}
                className={`flex items-center justify-center gap-2 sm:flex-1 ${
                  i > 0 ? "sm:border-l sm:border-primary-foreground/20" : ""
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span>{t.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <FeaturedProducts />

      {/* HOW IT WORKS */}
      <section className="bg-cream/40 py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Order in minutes.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:gap-6 md:grid-cols-3">
            {howSteps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-background p-7 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-5xl font-medium text-accent leading-none">
                    {s.n}
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <IndustriesStrip />

      {/* BLOGS */}
      <LatestBlogsStrip />
    </SiteLayout>
  );
}
