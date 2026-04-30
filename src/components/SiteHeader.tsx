import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, Search, ShoppingBag, User } from "lucide-react";
import logoUrl from "@/assets/moments-logo.png";
import { categories } from "@/data/products";
import { SearchCommand } from "@/components/SearchCommand";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = {
  to: "/" | "/products" | "/industries" | "/blog" | "/about";
  label: string;
  hasDropdown?: boolean;
};

const nav: readonly NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products", hasDropdown: true },
  { to: "/industries", label: "Industries" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSeed, setSearchSeed] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside (for click-to-open on touch)
  useEffect(() => {
    if (!productsOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [productsOpen]);

  // Global keyboard shortcut: ⌘K / Ctrl+K opens search anywhere
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping =
        tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchSeed("");
        setSearchOpen(true);
      } else if (e.key === "/" && !isTyping && !searchOpen) {
        e.preventDefault();
        setSearchSeed("");
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen]);

  const openDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setProductsOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setProductsOpen(false), 120);
  };

  const openSearch = (seed = "") => {
    setSearchSeed(seed);
    setSearchOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 lg:gap-5 lg:px-8">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Moments Packaging Kenya — Home">
            <img
              src={logoUrl}
              alt="Moments Packaging Kenya logo"
              width={140}
              height={32}
              className="h-8 w-auto sm:h-9"
            />
            <span className="hidden leading-tight xl:block">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Packaging (K) Limited
              </span>
            </span>
          </Link>

          {/* Desktop search bar (lg+). Acts as a trigger for the overlay. */}
          <button
            type="button"
            onClick={() => openSearch()}
            className="hidden h-10 flex-1 items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary lg:flex lg:max-w-md"
            aria-label="Search packaging"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 truncate">Search packaging…</span>
            <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground xl:inline">
              ⌘K
            </kbd>
          </button>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {nav.slice(0, -1).map((n) => {
              if (n.hasDropdown) {
                return (
                  <div
                    key={n.to}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={openDropdown}
                    onMouseLeave={scheduleClose}
                  >
                    <Link
                      to={n.to}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground lg:px-4"
                      activeProps={{ className: "bg-secondary text-foreground" }}
                      onClick={() => setProductsOpen(false)}
                    >
                      {n.label}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${productsOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </Link>

                    {productsOpen && (
                      <div
                        className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-2"
                        onMouseEnter={openDropdown}
                        onMouseLeave={scheduleClose}
                      >
                        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xl ring-1 ring-black/5">
                          <Link
                            to="/products"
                            search={{}}
                            onClick={() => setProductsOpen(false)}
                            className="block border-b border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                          >
                            All products
                          </Link>
                          {categories.map((c) => (
                            <Link
                              key={c.slug}
                              to="/products"
                              search={{ category: c.slug }}
                              onClick={() => setProductsOpen(false)}
                              className="block border-b border-border/60 px-4 py-3 text-sm text-foreground/80 transition-colors last:border-b-0 hover:bg-secondary hover:text-foreground"
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-full px-3 py-2 text-sm text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground lg:px-4"
                  activeProps={{ className: "bg-secondary text-foreground" }}
                  activeOptions={{ exact: n.to === "/" }}
                >
                  {n.label}
                </Link>
              );
            })}
            <Link
              to="/contact"
              className="ml-2 inline-flex items-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md lg:px-5"
            >
              Get a Quote
            </Link>
          </nav>

          {/* Tablet/mobile search icon (shown below lg, where the full search bar is hidden) */}
          <button
            type="button"
            onClick={() => openSearch()}
            aria-label="Search packaging"
            className="ml-auto grid h-10 w-10 place-items-center rounded-md border border-border text-foreground/80 transition-colors hover:bg-secondary md:ml-2 lg:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-md border border-border md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="flex flex-col px-5 py-3">
              {nav.map((n) => {
                if (n.hasDropdown) {
                  return (
                    <div key={n.to}>
                      <div className="flex items-center">
                        <Link
                          to={n.to}
                          onClick={() => setOpen(false)}
                          className="flex-1 rounded-md px-3 py-3 text-sm text-foreground/80 hover:bg-secondary"
                          activeProps={{ className: "bg-secondary text-foreground font-medium" }}
                        >
                          {n.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobileProductsOpen((v) => !v)}
                          aria-label="Toggle product categories"
                          className="grid h-10 w-10 place-items-center rounded-md text-foreground/60 hover:bg-secondary"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${mobileProductsOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>
                      {mobileProductsOpen && (
                        <div className="ml-3 border-l border-border pl-3">
                          <Link
                            to="/products"
                            search={{}}
                            onClick={() => setOpen(false)}
                            className="block rounded-md px-3 py-2.5 text-sm text-foreground/70 hover:bg-secondary"
                          >
                            All products
                          </Link>
                          {categories.map((c) => (
                            <Link
                              key={c.slug}
                              to="/products"
                              search={{ category: c.slug }}
                              onClick={() => setOpen(false)}
                              className="block rounded-md px-3 py-2.5 text-sm text-foreground/70 hover:bg-secondary"
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-sm text-foreground/80 hover:bg-secondary"
                    activeProps={{ className: "bg-secondary text-foreground font-medium" }}
                    activeOptions={{ exact: n.to === "/" }}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} initialQuery={searchSeed} />
    </>
  );
}
