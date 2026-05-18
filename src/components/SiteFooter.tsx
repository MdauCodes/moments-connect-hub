import { Link } from "@tanstack/react-router";
import { COMPANY_EMAIL, COMPANY_PHONE, WHATSAPP_NUMBER, INSTAGRAM_URL, TIKTOK_URL, categories } from "@/data/products";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-primary text-primary-foreground sm:mt-24">
      <div className="mx-auto grid gap-8 px-5 py-12 sm:gap-10 sm:py-16 md:grid-cols-4 max-w-7xl lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-foreground/10 font-display text-xl text-primary-foreground">
              m
            </span>
            <span className="font-display text-xl">Moments Packaging</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/70">
            Custom-branded paper packaging built for Kenya&apos;s restaurants, retailers and brands.
            From a 100-bag pilot run to enterprise contracts — delivered nationwide.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-primary-foreground/60">
            Shop
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/products" search={{}} className="hover:text-accent">All products</Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to="/products" search={{ category: c.slug }} className="hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/products" search={{ deals: true }} className="hover:text-accent">
                Deals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-primary-foreground/60">
            Explore
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
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
            <li>
              <a href={`tel:+${WHATSAPP_NUMBER}`} className="hover:text-accent">{COMPANY_PHONE}</a>
            </li>
            <li>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                WhatsApp: {COMPANY_PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-accent break-all">{COMPANY_EMAIL}</a>
            </li>
            <li>Industrial Area, Nairobi</li>
          </ul>
          <div className="mt-5 flex items-center gap-3 text-sm">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram @momentspackaging" className="hover:text-accent">Instagram</a>
            <span className="text-primary-foreground/30">·</span>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" aria-label="TikTok @momentspackaging" className="hover:text-accent">TikTok</a>
          </div>
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
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-primary-foreground/60 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Moments Packaging Kenya Ltd. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-accent">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-accent">Terms of Service</Link>
            <Link to="/contact" className="hover:text-accent">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
