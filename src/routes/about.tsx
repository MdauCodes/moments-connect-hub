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
        content:
          "Moments Packaging Kenya — a Nairobi-based packaging manufacturer serving food service, retail, e-commerce, gifting, agricultural and corporate sectors since 2013.",
      },
      { property: "og:title", content: "About — Moments Packaging Kenya" },
      {
        property: "og:description",
        content:
          "From a single press in 2013 to two full divisions — Moments Packaging supplies food and non-food packaging to Kenya's most ambitious brands.",
      },
    ],
  }),
  component: AboutPage,
});

const stats = [
  { v: "13+", l: "Years operating" },
  { v: "2", l: "Divisions" },
  { v: "500+", l: "Brands packed" },
  { v: "47", l: "Counties served" },
];

const values = [
  {
    n: "01", t: "Range",
    b: "We supply both food and non-food packaging from one floor — so our clients deal with one supplier instead of three.",
  },
  {
    n: "02", t: "Craft",
    b: "Every order is print-checked by hand. No batch leaves our floor without a second pair of eyes.",
  },
  {
    n: "03", t: "Speed",
    b: "We protect launch dates. 7–14 day production with rush options when seasons and marketing demand it.",
  },
  {
    n: "04", t: "Partnership",
    b: "We don't just sell boxes. We brief, design, sample and roll out packaging that helps your brand sell.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Our story
          </p>
          <h1 className="mt-5 max-w-5xl font-display text-5xl font-medium leading-[1.04] text-foreground text-balance sm:text-6xl lg:text-7xl">
            One supplier. Two divisions. <em className="not-italic text-[color:var(--forest)]">Every kind of packaging.</em>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Moments Packaging started in 2013 with a single offset press and one belief — that
            Kenyan businesses deserve packaging as good as anything imported. Today we operate
            two full divisions on one floor: Food Service, and Retail & Industrial.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-px border-x border-border bg-border lg:grid-cols-12">
          <div className="bg-background lg:col-span-6">
            <img
              src={aboutImg}
              alt="The Moments Packaging team in our Industrial Area workspace"
              className="aspect-[4/3] h-full w-full object-cover lg:aspect-auto"
            />
          </div>
          <div className="bg-background p-10 lg:col-span-6 lg:p-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Why two divisions
            </p>
            <h2 className="mt-4 font-display text-4xl font-medium text-foreground">
              Because Kenyan businesses don't fit neat boxes.
            </h2>
            <p className="mt-5 text-muted-foreground">
              A restaurant also needs branded carrier bags for takeaway. A supermarket needs deli boxes
              for its hot food counter. A coffee chain needs both cups and gift hampers at Christmas.
              Splitting our operation into Food Service and Retail & Industrial means we serve the
              full need — without you juggling three suppliers.
            </p>
            <p className="mt-4 text-muted-foreground">
              We blend offset and digital print, structural design, and hand finishing. We source
              FSC-certified paper where possible, and continue investing in lower-impact materials,
              inks and bagasse-based formats.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Work with us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats — editorial */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px border-x border-border bg-border lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="bg-cream p-8 lg:p-12">
              <p className="font-display text-5xl font-medium text-foreground sm:text-6xl">{s.v}</p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Values — editorial list */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                What we believe
              </p>
              <h2 className="mt-4 font-display text-4xl font-medium text-foreground sm:text-5xl">
                Four operating principles.
              </h2>
            </div>
            <ul className="divide-y divide-border border-y border-border lg:col-span-8">
              {values.map((v) => (
                <li key={v.n} className="flex items-start gap-8 py-7">
                  <span className="font-display text-3xl font-medium text-muted-foreground/70">
                    {v.n}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl text-foreground">{v.t}</h3>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{v.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
