import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { categories, products, whatsappLink } from "@/data/products";
import heroImg from "@/assets/hero-packaging.jpg";
import { ArrowRight, Check, MessageCircle, Sparkles, Truck, Award } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moments Packaging Kenya — Custom Branded Paper Packaging" },
      {
        name: "description",
        content:
          "Custom-branded paper bags, food boxes, cups, mailers and gifting packaging for Kenya's restaurants, retailers and brands. Low MOQ, fast turnaround, nationwide delivery.",
      },
      { property: "og:title", content: "Moments Packaging Kenya — Custom Branded Paper Packaging" },
      {
        property: "og:description",
        content: "Premium custom packaging for restaurants, retailers and corporates across Kenya.",
      },
    ],
  }),
  component: HomePage,
});

const trustLogos = ["JAVA HOUSE", "KFC", "SAFARICOM", "AIRTEL", "ARTCAFFE", "NAIVAS"];

const valueProps = [
  { icon: Sparkles, title: "Low MOQ from 100 units", body: "Pilot a small batch before scaling — perfect for new menus and product launches." },
  { icon: Truck, title: "Nationwide delivery", body: "From Mombasa to Kisumu — reliable lead times of 7–14 working days." },
  { icon: Award, title: "Custom branding", body: "1–4 colour print, embossing, foiling. Your logo, your colours, your way." },
];

function HomePage() {
  const featured = products.filter((p) => p.tags.includes("Featured") || p.tags.includes("Trending")).slice(0, 4);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="grain absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pt-14 pb-20 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-24 lg:pb-28">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Custom packaging · Made in Kenya
            </span>
            <h1 className="mt-6 font-display text-5xl font-medium leading-[1.02] text-foreground text-balance sm:text-6xl lg:text-7xl">
              Packaging that makes the <em className="not-italic text-accent">moment</em>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
              We design and print premium branded paper packaging for Kenya's most-loved
              restaurants, retailers and brands. From a 100-bag pilot to enterprise contracts.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Get a custom quote <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-7 py-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Browse catalogue
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-sm text-muted-foreground">
              {["MOQ from 100", "7–14 day lead time", "Free quote in 24h"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/10 via-kraft/10 to-forest/10 blur-2xl" />
            <div className="overflow-hidden rounded-[1.5rem] border border-border bg-background shadow-2xl shadow-ink/10">
              <img
                src={heroImg}
                alt="Branded kraft paper bags, cups and food boxes by Moments Packaging Kenya"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-border bg-background p-5 shadow-xl sm:block lg:-left-8">
              <p className="font-display text-3xl font-semibold text-foreground">500+</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                Brands packed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
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

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Catalogue</p>
            <h2 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">
              Built for every product, every brand.
            </h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent">
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/products"
              search={{ category: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[5/4] overflow-hidden bg-secondary">
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
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Why Moments</p>
            <h2 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">
              Real partners, not just printers.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
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
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Trending now</p>
            <h2 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">
              What our customers reorder.
            </h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <Link
              key={p.id}
              to="/products/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
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
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dual CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-primary p-10 text-primary-foreground lg:p-14">
            <span className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60">For Corporates</span>
            <h3 className="mt-3 font-display text-3xl lg:text-4xl">
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
          <div className="rounded-3xl bg-accent p-10 text-accent-foreground lg:p-14">
            <span className="text-xs uppercase tracking-[0.25em] text-accent-foreground/70">For SMEs</span>
            <h3 className="mt-3 font-display text-3xl lg:text-4xl">
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
        </div>
      </section>
    </SiteLayout>
  );
}
