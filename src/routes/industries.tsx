import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, UtensilsCrossed, ShoppingBag, Pill, Sparkles, Gift, Building2 } from "lucide-react";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries We Serve — Moments Packaging Kenya" },
      {
        name: "description",
        content: "Custom packaging solutions for Food & Beverage, Retail, Pharma, Beauty, Corporate Gifting and E-commerce across Kenya.",
      },
      { property: "og:title", content: "Industries We Serve — Moments Packaging Kenya" },
      { property: "og:description", content: "Packaging built for restaurants, retailers, pharma, beauty, gifting and e-commerce brands." },
    ],
  }),
  component: IndustriesPage,
});

const industries = [
  { icon: UtensilsCrossed, name: "Food & Beverage", body: "Restaurants, cafés, cloud kitchens. Branded burger boxes, cups, bags & wraps that survive delivery." },
  { icon: ShoppingBag, name: "Retail & Supermarket", body: "Carrier bags, tissue, and printed packaging for shoppers who post your bag on Instagram." },
  { icon: Building2, name: "Corporate & Enterprise", body: "Bulk runs with consistent print quality. Contract pricing and dedicated account managers." },
  { icon: Sparkles, name: "Beauty & Wellness", body: "Premium rigid boxes, sleeves, and labels for skincare, candles, and wellness brands." },
  { icon: Pill, name: "Pharma & Health", body: "Compliant cartons, inserts and labels for pharmacies, supplements and clinics." },
  { icon: Gift, name: "Corporate Gifting", body: "End-of-year hampers, onboarding kits and event swag — custom-built and ready on time." },
];

function IndustriesPage() {
  return (
    <SiteLayout>
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Industries</p>
            <h1 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-balance">
              Packaging for every kind of business.
            </h1>
            <p className="mt-5 text-base text-muted-foreground sm:mt-6 sm:text-lg">
              Whatever you sell, we've probably packed it. Here's how we work with the industries we
              serve every day across Kenya.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {industries.map((i) => (
            <div key={i.name} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl sm:p-8">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground transition-colors group-hover:bg-accent">
                <i.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl text-foreground sm:mt-6 sm:text-2xl">{i.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:pb-24 lg:px-8">
        <div className="rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12 lg:p-16">
          <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl">
                Don't see your industry? We probably still pack for it.
              </h3>
              <p className="mt-3 max-w-xl text-primary-foreground/75 sm:mt-4">
                Tell us what you sell. We'll recommend formats, sizes and pricing within 24 hours.
              </p>
            </div>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground px-6 py-3.5 text-sm font-medium text-primary sm:px-7 sm:py-4 lg:justify-self-end">
              Talk to our team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
