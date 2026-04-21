import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import {
  categoriesByDivision,
  divisions,
  productsByDivision,
  whatsappLink,
} from "@/data/products";
import heroFood from "@/assets/photos/hero-food.jpg";
import heroRetail from "@/assets/photos/hero-retail.jpg";
import { ArrowRight, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moments Packaging Kenya — Food, Retail & Industrial Packaging" },
      {
        name: "description",
        content:
          "A complete packaging partner for Kenyan businesses. Cups, food boxes, kraft bags, mailers, gifting and industrial supplies — custom-branded, low MOQ, delivered nationwide.",
      },
      {
        property: "og:title",
        content: "Moments Packaging Kenya — Food, Retail & Industrial Packaging",
      },
      {
        property: "og:description",
        content: "Two divisions, one partner. Packaging for food service, retail, e-commerce, gifting and agriculture across Kenya.",
      },
    ],
  }),
  component: HomePage,
});

const trustClients = ["Java House", "KFC", "Artcaffe", "Naivas", "Safaricom", "Carrefour"];

function HomePage() {
  const foodFeatured = productsByDivision("food").filter((p) => p.tags.includes("Featured")).slice(0, 3);
  const retailFeatured = productsByDivision("retail-industrial").filter((p) => p.tags.includes("Featured")).slice(0, 3);

  return (
    <SiteLayout>
      {/* ─── Marquee strip — sub-conscious dual-posture ─── */}
      <div className="border-b border-border bg-cream">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground lg:px-8">
          <span>Two divisions · One packaging partner for Kenya</span>
          <span className="hidden sm:inline">Food Service ⟶ Retail & Industrial ⟶ Custom Branding ⟶ Nationwide Delivery</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          HERO — split, two equal worlds
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 pt-16 lg:px-8 lg:pt-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            01 — Moments Packaging Kenya · Est. 2013
          </p>
          <h1 className="mt-6 max-w-5xl font-display text-5xl font-medium leading-[1.02] tracking-tight text-foreground text-balance sm:text-7xl lg:text-[5.5rem]">
            Whatever you make, <br className="hidden sm:block" />
            <em className="not-italic text-[color:var(--forest)]">we pack it.</em>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            From a single café's coffee cups to a supermarket's branded shoppers, from corporate
            gifting to agricultural baler twine — Moments Packaging is the one supplier Kenyan
            businesses trust across both food and non-food packaging.
          </p>
        </div>

        {/* Split hero — food | retail */}
        <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-px border-y border-border bg-border md:grid-cols-2 lg:px-0">
          {/* FOOD SIDE */}
          <Link
            to="/products"
            search={{ division: "food" }}
            className="group relative block overflow-hidden bg-background"
          >
            <div className="relative aspect-[5/4] overflow-hidden md:aspect-[4/5] lg:aspect-[5/6]">
              <img
                src={heroFood}
                alt="A served meal — the food we help businesses package and deliver"
                className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/70">
                  Division 01
                </span>
                <h2 className="mt-3 font-display text-4xl font-medium text-background sm:text-5xl">
                  Food Service Packaging
                </h2>
                <p className="mt-3 max-w-md text-sm text-background/80">
                  {divisions.food.tagline}. Cups, food boxes, trays, bagasse, foils, straws, hygienic supplies.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-background">
                  Browse food packaging <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>

          {/* RETAIL SIDE */}
          <Link
            to="/products"
            search={{ division: "retail-industrial" }}
            className="group relative block overflow-hidden bg-background"
          >
            <div className="relative aspect-[5/4] overflow-hidden md:aspect-[4/5] lg:aspect-[5/6]">
              <img
                src={heroRetail}
                alt="Branded shopping bags — the retail packaging we manufacture for shops and brands"
                className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/70">
                  Division 02
                </span>
                <h2 className="mt-3 font-display text-4xl font-medium text-background sm:text-5xl">
                  Retail & Industrial
                </h2>
                <p className="mt-3 max-w-md text-sm text-background/80">
                  {divisions["retail-industrial"].tagline}. Kraft bags, laminated shoppers, mailers, gifting, agri & bulk supplies.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-background">
                  Browse retail & industrial <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Mini-stats strip */}
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px border-b border-border bg-border md:grid-cols-4">
          {[
            { v: "13+", l: "Years in Nairobi" },
            { v: "2", l: "Divisions" },
            { v: "500+", l: "Brands packed" },
            { v: "47", l: "Counties served" },
          ].map((s) => (
            <div key={s.l} className="bg-background px-6 py-8 lg:px-8 lg:py-10">
              <p className="font-display text-4xl font-medium text-foreground sm:text-5xl">{s.v}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TRUST STRIP
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground lg:col-span-3">
              Trusted by Kenyan brands large and small
            </p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 sm:grid-cols-6 lg:col-span-9">
              {trustClients.map((l) => (
                <span
                  key={l}
                  className="text-center font-display text-base font-medium text-foreground/45"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DIVISION 01 — FOOD SERVICE (deep dive)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--clay)]">
                02 / Division 01
              </p>
              <h2 className="mt-4 font-display text-4xl font-medium text-foreground sm:text-5xl">
                For the kitchens that feed Kenya.
              </h2>
              <p className="mt-6 text-muted-foreground">
                Restaurants. Cafés. Cloud kitchens. Caterers. QSR chains. We supply the cups, boxes,
                trays, foils, films, straws and hygienic essentials that move from your kitchen to
                your customer — branded, food-safe and built to survive delivery.
              </p>

              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/75">
                {categoriesByDivision("food").map((c) => (
                  <li key={c.slug} className="flex items-center gap-2 border-l-2 border-[color:var(--clay)] pl-3">
                    {c.name}
                  </li>
                ))}
              </ul>

              <Link
                to="/products"
                search={{ division: "food" }}
                className="mt-10 inline-flex items-center gap-2 border-b border-foreground pb-1 font-mono text-xs uppercase tracking-[0.2em] text-foreground hover:border-[color:var(--clay)] hover:text-[color:var(--clay)]"
              >
                Browse food service catalogue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="lg:col-span-7">
              <ul className="divide-y divide-border border-y border-border">
                {foodFeatured.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DIVISION 02 — RETAIL & INDUSTRIAL (deep dive)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7 lg:order-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--forest)]">
                03 / Division 02
              </p>
              <h2 className="mt-4 font-display text-4xl font-medium text-foreground sm:text-5xl">
                For the brands customers carry home.
              </h2>
              <p className="mt-6 text-muted-foreground">
                Boutiques. Supermarkets. E-commerce sellers. Corporate procurement. Agro-processors.
                We make the kraft carriers, laminated smart bags, non-woven shoppers, mailers, labels,
                gifting boxes, grocery nets and baler twines that move your brand and your goods.
              </p>

              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/75">
                {categoriesByDivision("retail-industrial").map((c) => (
                  <li key={c.slug} className="flex items-center gap-2 border-l-2 border-[color:var(--forest)] pl-3">
                    {c.name}
                  </li>
                ))}
              </ul>

              <Link
                to="/products"
                search={{ division: "retail-industrial" }}
                className="mt-10 inline-flex items-center gap-2 border-b border-foreground pb-1 font-mono text-xs uppercase tracking-[0.2em] text-foreground hover:border-[color:var(--forest)] hover:text-[color:var(--forest)]"
              >
                Browse retail & industrial catalogue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="lg:col-span-5 lg:order-1">
              <ul className="divide-y divide-border border-y border-border bg-background">
                {retailFeatured.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PROCESS / WHY US — editorial spec block
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                04 — How we work
              </p>
              <h2 className="mt-4 font-display text-4xl font-medium text-foreground sm:text-5xl">
                A serious supplier, not a print shop.
              </h2>
            </div>
            <div className="lg:col-span-8">
              <ul className="divide-y divide-border border-y border-border">
                {[
                  {
                    n: "01", t: "Brief in 24 hours",
                    b: "Tell us the product, quantity and brand. We confirm sizing, MOQ and pricing within one working day.",
                  },
                  {
                    n: "02", t: "Proofs you can hold",
                    b: "Digital mock-ups first, then physical print proofs for high-volume runs. No surprises on press day.",
                  },
                  {
                    n: "03", t: "7–14 day production",
                    b: "Standard turnaround across both divisions. Rush slots available for marketing and seasonal launches.",
                  },
                  {
                    n: "04", t: "Delivered nationwide",
                    b: "Direct from our Industrial Area floor to Mombasa, Kisumu, Nakuru, Eldoret and 47 counties.",
                  },
                ].map((s) => (
                  <li key={s.n} className="flex items-start gap-8 py-6">
                    <span className="font-display text-3xl font-medium text-muted-foreground/70">
                      {s.n}
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-foreground">{s.t}</h3>
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{s.b}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DUAL CTA — corporate vs SME
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-px border border-background/20 bg-background/20 md:grid-cols-2">
            <div className="bg-foreground p-10 lg:p-14">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/55">
                For corporates & enterprise
              </p>
              <h3 className="mt-4 font-display text-3xl font-medium text-background lg:text-4xl">
                Volume contracts, dedicated production slots.
              </h3>
              <p className="mt-4 max-w-md text-sm text-background/70">
                Bulk pricing, quality consistency across runs, and an account manager who answers.
                Suited for QSR chains, supermarket groups, FMCG and corporate procurement.
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 border border-background bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
              >
                Request enterprise quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="bg-foreground p-10 lg:p-14">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/55">
                For SMEs & repeat orders
              </p>
              <h3 className="mt-4 font-display text-3xl font-medium text-background lg:text-4xl">
                Reorder in 30 seconds on WhatsApp.
              </h3>
              <p className="mt-4 max-w-md text-sm text-background/70">
                Browse the catalogue, tap order on any product, send. We confirm price, lead time and
                delivery — all in chat. Perfect for small restaurants and growing shops.
              </p>
              <a
                href={whatsappLink("Hi Moments Packaging, I'd like to place an order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 border border-[#25D366] bg-[#25D366] px-6 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
