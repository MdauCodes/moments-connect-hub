import { Link } from "@tanstack/react-router";
import { COMPANY_ADDRESS, COMPANY_EMAIL, COMPANY_PHONE, divisions } from "@/data/products";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center bg-background/10 font-display text-xl text-background">
                m
              </span>
              <span className="font-display text-2xl">Moments Packaging Kenya</span>
            </div>
            <p className="mt-6 max-w-md text-sm text-background/65">
              A Nairobi-based packaging manufacturer serving Kenya's food service, retail,
              gifting, e-commerce and agricultural sectors since 2013. Custom-branded, low MOQ,
              delivered nationwide.
            </p>
          </div>

          {/* Divisions */}
          <div className="lg:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/50">
              Divisions
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link to="/products" search={{ division: "food" }} className="hover:text-background/80">
                  {divisions.food.label}
                </Link>
              </li>
              <li>
                <Link to="/products" search={{ division: "retail-industrial" }} className="hover:text-background/80">
                  {divisions["retail-industrial"].label}
                </Link>
              </li>
            </ul>

            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-background/50">
              Explore
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/industries" className="hover:text-background/80">Industries we serve</Link></li>
              <li><Link to="/about" className="hover:text-background/80">About</Link></li>
              <li><Link to="/contact" className="hover:text-background/80">Request a quote</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/50">
              Contact
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`} className="hover:text-background/80">
                  {COMPANY_PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-background/80">
                  {COMPANY_EMAIL}
                </a>
              </li>
              <li className="text-background/65">{COMPANY_ADDRESS}</li>
              <li className="text-background/65">Mon–Sat · 8:00–17:00</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 font-mono text-[10px] uppercase tracking-[0.18em] text-background/50 sm:flex-row sm:items-center lg:px-8">
          <p>© {new Date().getFullYear()} Moments Packaging Kenya Ltd. — All rights reserved.</p>
          <p>Food Service · Retail · Industrial</p>
        </div>
      </div>
    </footer>
  );
}
