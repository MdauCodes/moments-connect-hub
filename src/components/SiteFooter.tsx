import { Link } from "@tanstack/react-router";
import { COMPANY_EMAIL, COMPANY_PHONE } from "@/data/products";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-primary text-primary-foreground sm:mt-24">
      <div className="mx-auto grid gap-8 px-5 py-12 sm:gap-10 sm:py-16 md:grid-cols-3 max-w-7xl lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-foreground/10 font-display text-xl text-primary-foreground">
              m
            </span>
            <span className="font-display text-xl">Moments Packaging Kenya</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/70">
            Custom-branded paper packaging built for Kenya's restaurants, retailers and brands.
            From a 100-bag pilot run to enterprise contracts — delivered nationwide.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-primary-foreground/60">
            Explore
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-accent">Products</Link></li>
            <li><Link to="/industries" className="hover:text-accent">Industries</Link></li>
            <li><Link to="/blog" className="hover:text-accent">Blog</Link></li>
            <li><Link to="/about" className="hover:text-accent">About</Link></li>
            <li><Link to="/orders/track" className="hover:text-accent">Track Order</Link></li>
            <li><Link to="/enterprise-quote" className="hover:text-accent">Enterprise Quote</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-primary-foreground/60">
            Contact
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li>{COMPANY_PHONE}</li>
            <li>{COMPANY_EMAIL}</li>
            <li>Industrial Area, Nairobi</li>
          </ul>
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50">
              We accept
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground/70">
              <span className="rounded-full border border-primary-foreground/20 px-2.5 py-1">M-Pesa</span>
              <span className="rounded-full border border-primary-foreground/20 px-2.5 py-1">Bank Transfer</span>
              <span className="rounded-full border border-primary-foreground/20 px-2.5 py-1">Cash on Delivery</span>
            </div>
          </div>
        </div>

      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-primary-foreground/60 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Moments Packaging Kenya Ltd. All rights reserved.</p>
          <p>Custom packaging • Nationwide delivery</p>
        </div>
      </div>
    </footer>
  );
}
