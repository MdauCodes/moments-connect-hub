import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Catalogue" },
  { to: "/industries", label: "Industries" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        {/* Wordmark */}
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center bg-primary font-display text-lg font-semibold text-primary-foreground">
            m
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold text-foreground">
              Moments Packaging
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Nairobi · Est. 2013
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="inline-flex items-center bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Request a quote
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center border border-border md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col px-5 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/50 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-foreground/70"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              Request a quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
