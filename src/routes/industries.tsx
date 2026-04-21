import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { divisions } from "@/data/products";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries We Serve — Moments Packaging Kenya" },
      {
        name: "description",
        content:
          "Custom packaging for restaurants, supermarkets, e-commerce, agriculture, pharma, gifting, events, beauty and corporate brands across Kenya.",
      },
      { property: "og:title", content: "Industries We Serve — Moments Packaging Kenya" },
      {
        property: "og:description",
        content:
          "Two divisions, every industry. Food packaging for kitchens; retail & industrial packaging for shops, e-commerce, agri and corporate.",
      },
    ],
  }),
  component: IndustriesPage,
});

const industries = [
  {
    n: "01",
    division: "food" as const,
    name: "Restaurants & QSR",
    body: "Branded burger boxes, coffee cups, deli boxes and meal trays that survive Glovo and Bolt deliveries — with the print quality your brand demands.",
    products: ["Coffee cups", "Burger boxes", "Pizza boxes", "Aluminium trays"],
  },
  {
    n: "02",
    division: "food" as const,
    name: "Cafés, Bakeries & Cloud Kitchens",
    body: "From a single café to a cloud kitchen running 8 brands — branded packaging that keeps food hot, tidy and on-brand from kitchen to customer.",
    products: ["Cake & deli boxes", "Bagasse trays", "Hot cups", "Branded mailers"],
  },
  {
    n: "03",
    division: "food" as const,
    name: "Caterers & Events",
    body: "Bulk packaging that ships when you need it. Hygienic supplies, foils, films, cutlery, hand gloves and skewers in event-ready quantities.",
    products: ["Foil rolls", "Cling film", "Hairnets", "Wrapped toothpicks"],
  },
  {
    n: "04",
    division: "retail-industrial" as const,
    name: "Retail & Supermarkets",
    body: "Carrier bags customers want to reuse — laminated smart bags, kraft shoppers and non-woven carriers. The bag IS the marketing.",
    products: ["Laminated smart bags", "Kraft carriers", "Non-woven shoppers", "SOS grocery bags"],
  },
  {
    n: "05",
    division: "retail-industrial" as const,
    name: "E-commerce & Online Sellers",
    body: "Tear-strip mailers and shipping cartons that survive the courier and double as a brand impression when your customer opens the box.",
    products: ["Kraft mailers", "Shipping cartons", "Branded labels", "Tissue paper"],
  },
  {
    n: "06",
    division: "retail-industrial" as const,
    name: "Corporate Gifting",
    body: "End-of-year hampers, onboarding kits, conference swag — rigid magnetic-close boxes, hampers and printed gift sets, ready when you need them.",
    products: ["Rigid gift boxes", "Hamper crates", "Tissue & ribbon", "Branded sleeves"],
  },
  {
    n: "07",
    division: "retail-industrial" as const,
    name: "Agriculture & Agro-processing",
    body: "Mesh grocery nets, polythene baler twines and bulk poly supplies for farms, cooperatives, agro-processors and fresh-produce distributors.",
    products: ["Grocery nets", "Baler twine 100mm", "Baler twine 1000mm", "Bulk poly bags"],
  },
  {
    n: "08",
    division: "retail-industrial" as const,
    name: "Pharma, Beauty & Wellness",
    body: "Compliant cartons, premium rigid sleeves, adhesive labels and sealed packaging for pharmacies, skincare, supplements and clinics.",
    products: ["Folding cartons", "Rigid sleeves", "Die-cut labels", "Sealed inserts"],
  },
];

function IndustriesPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Industries served · 8 sectors
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-medium leading-[1.05] text-foreground text-balance sm:text-6xl lg:text-7xl">
            Whatever you sell, we've packed it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Two divisions, eight industries. Restaurants, supermarkets, e-commerce, agriculture,
            corporate gifting, pharma, beauty, events — Moments Packaging supplies the lot.
          </p>
        </div>
      </section>

      {/* Industry list */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8">
        <ul className="border-b border-border">
          {industries.map((ind) => (
            <li key={ind.n} className="border-t border-border">
              <div className="grid gap-6 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
                {/* Number + division */}
                <div className="lg:col-span-2">
                  <p className="font-display text-5xl font-medium text-muted-foreground/60">
                    {ind.n}
                  </p>
                  <p
                    className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{
                      color:
                        ind.division === "food"
                          ? "var(--clay)"
                          : "var(--forest)",
                    }}
                  >
                    {divisions[ind.division].label}
                  </p>
                </div>

                {/* Title + body */}
                <div className="lg:col-span-6">
                  <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
                    {ind.name}
                  </h2>
                  <p className="mt-4 max-w-xl text-muted-foreground">{ind.body}</p>
                </div>

                {/* Product chips */}
                <div className="lg:col-span-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Typical products
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {ind.products.map((p) => (
                      <li
                        key={p}
                        className="border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/products"
                    search={{ division: ind.division }}
                    className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-[color:var(--forest)]"
                  >
                    Browse {divisions[ind.division].label.toLowerCase()} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-background/55">
                Don't see your sector?
              </p>
              <h3 className="mt-4 font-display text-4xl font-medium text-background sm:text-5xl">
                We probably still pack for it.
              </h3>
              <p className="mt-5 max-w-xl text-background/70">
                Tell us what you sell — fresh produce, electronics, hardware, mattresses, anything.
                We'll recommend formats, sizes and pricing within 24 hours.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border border-background bg-background px-7 py-4 text-sm font-medium text-foreground hover:bg-background/90 lg:col-span-4 lg:justify-self-end"
            >
              Talk to our team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
