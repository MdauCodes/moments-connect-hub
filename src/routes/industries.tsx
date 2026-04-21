import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight } from "lucide-react";
import foodImg from "@/assets/photos/food-takeaway.jpg";
import retailImg from "@/assets/photos/retail-bags.jpg";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries — Moments Packaging Kenya" },
      {
        name: "description",
        content: "Packaging for restaurants, supermarkets, e-commerce, agriculture, gifting, pharma and more across Kenya.",
      },
      { property: "og:title", content: "Industries — Moments Packaging Kenya" },
      { property: "og:description", content: "Two divisions, every sector." },
    ],
  }),
  component: IndustriesPage,
});

const food = [
  { name: "Restaurants & QSR", products: "Burger boxes · Coffee cups · Trays" },
  { name: "Cafés & Bakeries", products: "Hot cups · Cake boxes · Bagasse" },
  { name: "Cloud Kitchens", products: "Branded mailers · Deli boxes" },
  { name: "Caterers & Events", products: "Foils · Films · Cutlery · Gloves" },
];

const retail = [
  { name: "Retail & Supermarkets", products: "Kraft bags · Smart bags · Non-woven" },
  { name: "E-commerce", products: "Mailers · Cartons · Labels" },
  { name: "Corporate Gifting", products: "Rigid boxes · Hampers · Sleeves" },
  { name: "Agriculture & Agri-processing", products: "Grocery nets · Baler twine" },
  { name: "Pharma & Beauty", products: "Cartons · Labels · Sealed inserts" },
];

function IndustriesPage() {
  return (
    <SiteLayout>
      {/* Hero — short */}
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Industries
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-medium leading-[1.04] text-foreground sm:text-6xl lg:text-7xl">
            Whatever you sell — we pack it.
          </h1>
        </div>
      </section>

      {/* Two-column division split */}
      <section className="bg-background">
        <div className="grid gap-px bg-border lg:grid-cols-2">
          {/* FOOD */}
          <div className="bg-background">
            <Link to="/products" search={{ division: "food" }} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={foodImg} alt="Food service packaging" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/70">
                    Division 01
                  </span>
                  <h2 className="mt-2 font-display text-3xl font-medium text-background sm:text-4xl">
                    Food Service
                  </h2>
                </div>
              </div>
            </Link>
            <ul className="divide-y divide-border border-y border-border">
              {food.map((s) => (
                <li key={s.name} className="px-5 py-5 lg:px-8">
                  <p className="font-display text-xl text-foreground">{s.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {s.products}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* RETAIL */}
          <div className="bg-background">
            <Link to="/products" search={{ division: "retail-industrial" }} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={retailImg} alt="Retail and industrial packaging" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/70">
                    Division 02
                  </span>
                  <h2 className="mt-2 font-display text-3xl font-medium text-background sm:text-4xl">
                    Retail & Industrial
                  </h2>
                </div>
              </div>
            </Link>
            <ul className="divide-y divide-border border-y border-border">
              {retail.map((s) => (
                <li key={s.name} className="px-5 py-5 lg:px-8">
                  <p className="font-display text-xl text-foreground">{s.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {s.products}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-14 lg:px-8 lg:py-16">
          <h3 className="font-display text-3xl font-medium sm:text-4xl">
            Don't see your sector?
          </h3>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-background px-6 py-3.5 text-sm font-medium text-foreground hover:bg-background/90">
            Talk to us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
