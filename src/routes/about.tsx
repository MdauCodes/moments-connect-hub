import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import aboutImg from "@/assets/photos/about-floor.jpg";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Moments Packaging Kenya" },
      {
        name: "description",
        content: "Nairobi-based packaging manufacturer since 2013. Food service, retail, gifting, agriculture and corporate.",
      },
      { property: "og:title", content: "About — Moments Packaging Kenya" },
      { property: "og:description", content: "One supplier. Two divisions." },
    ],
  }),
  component: AboutPage,
});

const stats = [
  { v: "13+", l: "Years operating" },
  { v: "2", l: "Divisions" },
  { v: "500+", l: "Brands packed" },
  { v: "47", l: "Counties" },
];

const values = [
  { t: "Range", b: "Food + non-food, one floor." },
  { t: "Craft", b: "Every batch hand-checked." },
  { t: "Speed", b: "7–14 days, every time." },
  { t: "Partnership", b: "We brief, sample, deliver." },
];

function AboutPage() {
  return (
    <SiteLayout>
      {/* Hero — full image with overlay */}
      <section className="relative h-[480px] w-full overflow-hidden bg-foreground sm:h-[560px]">
        <img src={aboutImg} alt="The Moments Packaging factory floor in Nairobi" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/45 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-12 lg:px-8 lg:pb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-background/70">
            About · Est. 2013
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-medium leading-[1.04] text-background sm:text-6xl lg:text-7xl">
            One supplier. <em className="not-italic text-[color:var(--clay)]">Every kind of packaging.</em>
          </h1>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="bg-cream p-7 lg:p-10">
              <p className="font-display text-4xl font-medium text-foreground sm:text-5xl">{s.v}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story — short */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Our story
          </p>
          <p className="mt-5 font-display text-2xl leading-snug text-foreground sm:text-3xl">
            Started in 2013 with one offset press. Today we run two full divisions on one Nairobi floor —
            so Kenyan businesses deal with one supplier, not three.
          </p>
        </div>
      </section>

      {/* Values — 4 short */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">What we believe</h2>
          <ul className="mt-10 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <li key={v.t} className="bg-cream p-7 lg:p-10">
                <h3 className="font-display text-2xl font-medium text-foreground">{v.t}</h3>
                <p className="mt-2 text-muted-foreground">{v.b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-14 lg:px-8 lg:py-16">
          <h3 className="font-display text-3xl font-medium sm:text-4xl">Work with us.</h3>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-background px-6 py-3.5 text-sm font-medium text-foreground hover:bg-background/90">
            Request a quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
