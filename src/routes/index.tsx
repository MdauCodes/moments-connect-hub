
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { categories, products, whatsappLink } from "@/data/products";
import { usePersona } from "@/contexts/PersonaContext";
import { useBasket } from "@/contexts/BasketContext";
import { PackagingCloud } from "@/components/PackagingCloud";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { IndustriesStrip } from "@/components/IndustriesStrip";
import { LatestBlogsStrip } from "@/components/blog/LatestBlogsStrip";
import { ArrowRight, MessageCircle, Sparkles, Truck, Award } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moments Packaging Kenya — Custom Branded Paper Packaging | Nairobi" },
      {
        name: "description",
        content:
          "Kenya's trusted custom packaging manufacturer. Branded paper bags, food boxes, cups, mailers and gifting packaging from 100 units. Based in Nairobi, delivering nationwide.",
      },
      { property: "og:title", content: "Moments Packaging Kenya — Custom Branded Paper Packaging" },
      {
        property: "og:description",
        content:
          "Premium custom packaging for restaurants, retailers and corporates across Kenya. Low MOQ, fast turnaround, nationwide delivery.",
      },
      { property: "og:image", content: "https://www.momentspackaging.com/og-image.jpg" },
      { name: "twitter:image", content: "https://www.momentspackaging.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.momentspackaging.com/" }],
  }),
  component: HomePage,
});

// const trustLogos = ["JAVA HOUSE", "KFC", "SAFARICOM", "AIRTEL", "ARTCAFFE", "NAIVAS"]; // re-enable with trust strip

const smeValueProps = [
  { icon: Sparkles, title: "Low MOQ from 100 units", body: "Pilot a small batch before scaling — perfect for new menus and product launches." },
  { icon: Truck, title: "Nationwide delivery", body: "From Mombasa to Kisumu — reliable lead times of 7–14 working days." },
  { icon: Award, title: "Custom branding", body: "1–4 colour print, embossing, foiling. Your logo, your colours, your way." },
];

const corpValueProps = [
  { icon: Sparkles, title: "Dedicated production slots", body: "Reserved capacity means your orders are never delayed by other clients." },
  { icon: Truck, title: "Nationwide enterprise delivery", body: "Coordinated bulk delivery across all your outlets — Nairobi, Mombasa, Kisumu." },
  { icon: Award, title: "Contracts & account management", body: "A named account manager, formal SLAs, and invoicing on net-30 terms." },
];

function HomePage() {
  const { persona } = usePersona();
  const basket = useBasket();
  const isCorp = persona === "corporate";
  const isSme = persona === "sme";

  

  const featured = products.filter((p) => p.tags.includes("Featured") || p.tags.includes("Trending")).slice(0, 4);
  const valueProps = isCorp ? corpValueProps : smeValueProps;

  return (
    <SiteLayout>
      {/* Hero — compact, fits within viewport with next section peeking */}
      <section className="relative overflow-hidden bg-cream lg:h-[78vh] lg:max-h-[680px] lg:min-h-[540px]">
        <div className="grain absolute inset-0 opacity-60" aria-hidden />

        {/* Mobile/tablet: cloud centered behind content, larger and more present */}
        <div
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-40 lg:hidden"
          aria-hidden
        >
          <div className="h-[120%] w-[120%] max-w-none">
            <PackagingCloud />
          </div>
        </div>

        {/* Desktop: cloud is full-bleed on the right half, edge to edge top/bottom */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-1/2 lg:block">
          <div className="relative h-full w-full">
            <PackagingCloud />
          </div>
        </div>

        <div className="relative z-10 mx-auto grid h-full max-w-7xl items-center gap-8 px-5 pt-8 pb-10 sm:pt-10 sm:pb-12 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-0">
          <div className="lg:col-span-6">
            <h1 className="font-display text-[2rem] font-medium leading-[1.1] text-foreground text-balance sm:text-5xl lg:text-6xl">
              {isCorp ? (
                <>Volume packaging, <em className="not-italic text-accent">delivered on brief</em>.</>
              ) : (
                <>Packaging that makes the <em className="not-italic text-accent">moment</em>.</>
              )}
            </h1>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground text-balance sm:text-base lg:text-lg">
              {isCorp
                ? "Dedicated production slots, bulk pricing and contracts for Kenya's biggest brands. From 10,000-unit runs to nationwide rollouts — one supplier, zero stress."
                : "We design and print premium branded paper packaging for Kenya's most-loved restaurants, retailers and brands. From a 100-bag pilot to enterprise contracts."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 hover:shadow-xl sm:px-6"
              >
                {isCorp ? "Request enterprise quote" : "Get a free quote"} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:px-6"
              >
                {isCorp ? "View case studies" : "Browse catalogue"}
              </Link>
            </div>

            {/* Stat row */}
            <dl className="mt-7 grid max-w-lg grid-cols-3 gap-3 border-t border-border pt-5 sm:gap-6">
              {(isCorp
                ? [
                    { value: "5,000+", label: "Min order units" },
                    { value: "24h", label: "Quote turnaround" },
                    { value: "Net-30", label: "Contract terms" },
                  ]
                : [
                    { value: "100", label: "MOQ units" },
                    { value: "7–14", label: "Day lead time" },
                    { value: "500+", label: "Brands packed" },
                  ]
              ).map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-xl font-medium text-foreground sm:text-3xl">{s.value}</dt>
                  <dd className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:text-[11px] sm:tracking-[0.18em]">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Spacer column on desktop so the text doesn't overlap the cloud */}
          <div className="hidden lg:col-span-6 lg:block" aria-hidden />
        </div>
      </section>

      {/*
        Trust strip — temporarily hidden until brand permissions are confirmed.
        Uncomment once the listed brands have approved use of their names/logos.

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Trusted by Kenya's most-loved brands
          </p>
          <div className="mt-6 grid grid-cols-3 gap-x-6 gap-y-4 text-center sm:grid-cols-6">
            {trustLogos.map((l) => (
              <span key={l} className="font-display text-base font-medium tracking-wider text-foreground/40">
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* Curated picks: discounts / new arrivals / fast movers (admin-flagged) */}
      <FeaturedCarousel />

      {/* Self-presenting marquee with tabs per category */}
      <CategoryShowcase />

      {/* Industries we serve — market segmentation strip */}
      <IndustriesStrip />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Catalogue</p>
            <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              {isCorp ? "Built for scale, built for your brand." : "Built for every product, every brand."}
            </h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent">
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/products"
              search={{ category: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[16/9] overflow-hidden bg-secondary">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-medium text-foreground">{c.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-secondary/60">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Why Moments</p>
            <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              {isCorp ? "Built for brands that operate at scale." : "Real partners, not just printers."}
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-3">
            {valueProps.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-background p-8">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-xl text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">
              {isCorp ? "Most ordered by enterprise clients" : "Trending now"}
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              {isCorp ? "What Kenya's biggest brands choose." : "What our customers reorder."}
            </h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <Link
              key={p.id}
              to="/products/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {p.tags[0] && (
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur">
                    {p.tags[0]}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg text-foreground">{p.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">MOQ {p.moq.toLocaleString()} units</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  View product <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
                {basket.isInBasket(p.id) ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      basket.remove(p.id);
                    }}
                    className="mt-2 w-full rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/15"
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
                    className="mt-2 w-full rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    + Add to enquiry
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dual CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:pb-24 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-primary p-7 text-primary-foreground sm:p-10 lg:p-14">
            <span className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60">For Corporates</span>
            <h3 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl">
              Need volume packaging for your brand?
            </h3>
            <p className="mt-4 max-w-md text-primary-foreground/75">
              Talk to our enterprise team. Bulk pricing, contracts, and dedicated production slots.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary-foreground/90"
            >
              Request enterprise quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isSme ? (
            <div className="rounded-3xl bg-accent p-7 text-accent-foreground sm:p-10 lg:p-14">
              <span className="text-xs uppercase tracking-[0.25em] text-accent-foreground/70">For SMEs</span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl">
                Reorder in 30 seconds via WhatsApp.
              </h3>
              <p className="mt-4 max-w-md text-accent-foreground/85">
                Browse our catalogue, tap order on any product — we'll handle the rest.
              </p>
              <a
                href={whatsappLink("Hi Moments Packaging, I'd like to place an order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-foreground px-6 py-3.5 text-sm font-medium text-accent transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-7 text-foreground sm:p-10 lg:p-14">
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">For your team</span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl">
                Need samples before committing?
              </h3>
              <p className="mt-4 max-w-md text-muted-foreground">
                Request a branded sample pack — we'll produce a small run with your logo so you can approve before full production.
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Request sample pack <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Latest blog stories — sits just before the footer */}
      <LatestBlogsStrip />
    </SiteLayout>
  );
}
