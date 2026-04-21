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
          HERO — split (food / retail), fits within viewport.
          Sized so the stat strip below peeks into view.
          ═══════════════════════════════════════════════ */}
      <section className="relative w-full bg-foreground">
        <div className="grid h-[calc(100svh-10rem)] min-h-[460px] max-h-[720px] grid-cols-1 md:grid-cols-2">
          {/* FOOD SIDE */}
          <Link
            to="/products"
            search={{ division: "food" }}
            className="group relative block overflow-hidden"
          >
            <img
              src={foodImg}
              alt="Branded kraft takeaway food box from a Nairobi café"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/35 to-foreground/10" />
            <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 lg:p-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/70">
                Division 01
              </span>
              <h2 className="mt-2 font-display text-3xl font-medium leading-tight text-background sm:text-4xl lg:text-5xl">
                Food Service
              </h2>
              <span className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background">
                Browse <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* RETAIL SIDE */}
          <Link
            to="/products"
            search={{ division: "retail-industrial" }}
            className="group relative block overflow-hidden border-t border-background/15 md:border-l md:border-t-0"
          >
            <img
              src={retailImg}
              alt="Branded kraft retail shopping bags on a counter"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/35 to-foreground/10" />
            <div className="relative flex h-full flex-col justify-end p-6 sm:p-8 lg:p-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/70">
                Division 02
              </span>
              <h2 className="mt-2 font-display text-3xl font-medium leading-tight text-background sm:text-4xl lg:text-5xl">
                Retail & Industrial
              </h2>
              <span className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background">
                Browse <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>

        {/* Floating headline overlay (absolute → no extra height) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
          <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8 lg:pt-10">
            <p className="pointer-events-auto font-mono text-[10px] uppercase tracking-[0.28em] text-background/80 sm:text-[11px]">
              Moments Packaging · Nairobi
            </p>
            <h1 className="pointer-events-auto mt-2 max-w-2xl font-display text-3xl font-medium leading-[1.05] tracking-tight text-background sm:text-4xl lg:text-5xl">
              Packaging for <em className="not-italic text-[color:var(--clay)]">every</em> Kenyan business.
            </h1>
            <a
              href={whatsappLink("Hi Moments Packaging, I'd like to enquire about packaging.")}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto mt-4 inline-flex items-center gap-2 bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </div>
      </section>

      {/* Stat strip — peeks below the hero fold */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {[
            { v: "13+", l: "Years in Nairobi" },
            { v: "500+", l: "Brands packed" },
            { v: "47", l: "Counties served" },
            { v: "7–14", l: "Day production" },
          ].map((s) => (
            <div key={s.l} className="bg-cream px-6 py-6 lg:px-8">
              <p className="font-display text-2xl font-medium text-foreground sm:text-3xl">{s.v}</p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {s.l}
              </p>
            </div>
          ))}
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
