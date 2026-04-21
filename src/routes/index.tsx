import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { whatsappLink } from "@/data/products";
import foodImg from "@/assets/photos/food-takeaway.jpg";
import retailImg from "@/assets/photos/retail-bags.jpg";
import { ArrowRight, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moments Packaging Kenya — Food, Retail & Industrial Packaging" },
      {
        name: "description",
        content:
          "Custom packaging for Kenyan businesses. Food service, retail, gifting, agri & industrial — branded, low MOQ, delivered nationwide.",
      },
      { property: "og:title", content: "Moments Packaging Kenya" },
      { property: "og:description", content: "Custom packaging for Kenyan businesses." },
    ],
  }),
  component: HomePage,
});

const trustClients = ["Java House", "KFC", "Artcaffe", "Naivas", "Safaricom", "Carrefour"];

function HomePage() {
  return (
    <SiteLayout>
      {/* ═══════════════════════════════════════════════
          HERO — single full-bleed, scanning-first
          ═══════════════════════════════════════════════ */}
      <section className="relative h-[640px] w-full overflow-hidden bg-foreground sm:h-[720px] lg:h-[760px]">
        <img
          src={heroCounter}
          alt="A Nairobi café counter with branded paper bags, kraft food boxes and coffee cups"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-foreground/10" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 lg:px-8 lg:pb-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-background/70">
            Moments Packaging · Nairobi
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-medium leading-[1.02] tracking-tight text-background sm:text-6xl lg:text-7xl">
            Packaging for <em className="not-italic text-[color:var(--clay)]">every</em> Kenyan business.
          </h1>
          <p className="mt-5 max-w-lg text-base text-background/80 sm:text-lg">
            Food service. Retail. Industrial. One supplier.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              Browse catalogue <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappLink("Hi Moments Packaging, I'd like to enquire about packaging.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-background/40 px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-background/10"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </div>
      </section>

      {/* Stat strip — directly under hero */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {[
            { v: "13+", l: "Years in Nairobi" },
            { v: "500+", l: "Brands packed" },
            { v: "47", l: "Counties served" },
            { v: "7–14", l: "Day production" },
          ].map((s) => (
            <div key={s.l} className="bg-cream px-6 py-7 lg:px-8">
              <p className="font-display text-3xl font-medium text-foreground sm:text-4xl">{s.v}</p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TWO DIVISIONS — image-led, ≤8 words each
          ═══════════════════════════════════════════════ */}
      <section className="bg-background">
        <div className="grid gap-px bg-border md:grid-cols-2">
          {/* FOOD */}
          <Link
            to="/products"
            search={{ division: "food" }}
            className="group relative block overflow-hidden bg-background"
          >
            <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[5/4]">
              <img
                src={foodImg}
                alt="Hand holding a kraft takeaway food box"
                className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/70">
                  Division 01
                </span>
                <h2 className="mt-2 font-display text-3xl font-medium text-background sm:text-4xl">
                  Food Service Packaging
                </h2>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background">
                  Browse <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>

          {/* RETAIL */}
          <Link
            to="/products"
            search={{ division: "retail-industrial" }}
            className="group relative block overflow-hidden bg-background"
          >
            <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[5/4]">
              <img
                src={retailImg}
                alt="Branded kraft paper shopping bags on a retail counter"
                className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/70">
                  Division 02
                </span>
                <h2 className="mt-2 font-display text-3xl font-medium text-background sm:text-4xl">
                  Retail & Industrial
                </h2>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background">
                  Browse <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TRUST STRIP — minimal
          ═══════════════════════════════════════════════ */}
      <section className="border-y border-border bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          <div className="grid items-center gap-6 lg:grid-cols-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground lg:col-span-3">
              Trusted across Kenya
            </p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3 sm:grid-cols-6 lg:col-span-9">
              {trustClients.map((l) => (
                <span key={l} className="text-center font-display text-sm font-medium text-foreground/45 sm:text-base">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS — 3 steps, ultra-brief
          ═══════════════════════════════════════════════ */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-border pb-6">
            <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
              How we work
            </h2>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
              Three steps · Two weeks
            </p>
          </div>
          <ol className="grid gap-px bg-border md:grid-cols-3">
            {[
              { n: "01", t: "Brief", b: "Send specs on WhatsApp." },
              { n: "02", t: "Proof", b: "We mock up & confirm." },
              { n: "03", t: "Deliver", b: "Printed in 7–14 days." },
            ].map((s) => (
              <li key={s.n} className="bg-background p-8 lg:p-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {s.n}
                </p>
                <h3 className="mt-3 font-display text-2xl font-medium text-foreground">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA — single, blunt
          ═══════════════════════════════════════════════ */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="grid items-end gap-8 lg:grid-cols-12">
            <h2 className="font-display text-4xl font-medium leading-tight sm:text-5xl lg:col-span-8">
              Ready to brief us?
            </h2>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-self-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-background px-6 py-3.5 text-sm font-medium text-foreground hover:bg-background/90"
              >
                Request a quote <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappLink("Hi Moments Packaging, I'd like to enquire.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#25D366] bg-[#25D366] px-6 py-3.5 text-sm font-medium text-white hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
