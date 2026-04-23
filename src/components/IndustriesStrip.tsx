import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { industries } from "@/data/products";

/**
 * Compact "Industries we serve" band used on the homepage just below the
 * value-prop sections. Communicates market breadth at a glance and links
 * each chip to the pre-filtered catalogue (`/products?industry=<slug>`).
 */
export function IndustriesStrip() {
  return (
    <section className="border-y border-border bg-cream/60">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Markets we serve</p>
            <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              Packaging for every kind of business in Kenya.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              From your cousin's bakery to nationwide enterprise rollouts — eight industries,
              one production line. Tap any sector to see what we make for it.
            </p>
          </div>
          <Link
            to="/industries"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
          >
            See all industries <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {industries.map((ind) => (
            <li key={ind.id}>
              <Link
                to="/products"
                search={{ industry: ind.slug }}
                className="group flex h-full flex-col rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-2xl" aria-hidden>
                    {ind.icon}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
                <h3 className="mt-4 font-display text-lg text-foreground">{ind.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {ind.tagline ?? ind.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
