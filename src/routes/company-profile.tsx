import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowRight, Sparkles, Leaf, ShieldCheck, Users, Award, Phone, Mail, MapPin, Globe, MessageCircle, Check } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import pdfAsset from "@/assets/moments-company-profile.pdf.asset.json";
import { COMPANY_EMAIL, COMPANY_PHONE, WHATSAPP_NUMBER } from "@/data/products";

export const Route = createFileRoute("/company-profile")({
  head: () => ({
    meta: [
      { title: "Company Profile — Moments Packaging Kenya" },
      {
        name: "description",
        content:
          "Moments Packaging (K) Ltd — quality, sustainable packaging for Kenyan brands. Our story, vision, values, products and how to work with us.",
      },
      { property: "og:title", content: "Company Profile — Moments Packaging Kenya" },
      {
        property: "og:description",
        content:
          "Trusted Nairobi-based packaging partner serving food, beverage, FMCG, beauty, retail and agriculture across Kenya.",
      },
      { property: "og:url", content: "https://moments-demo.site/company-profile" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://moments-demo.site/company-profile" }],
  }),
  component: CompanyProfilePage,
});

const VALUES = [
  { Icon: Award, title: "Excellence", body: "We hold to the highest standards in every customer interaction." },
  { Icon: Sparkles, title: "Innovation", body: "We explore new ideas, technologies, and packaging trends to deliver superior solutions." },
  { Icon: ShieldCheck, title: "Integrity", body: "We do business with honesty, transparency, and professionalism." },
  { Icon: Leaf, title: "Sustainability", body: "We commit to environmentally responsible packaging that supports a greener future." },
  { Icon: Users, title: "Customer Success", body: "We measure our success by the growth and satisfaction of our clients." },
];

const WHY = [
  { title: "Innovative solutions", body: "Creative packaging concepts that help brands stand out in competitive markets." },
  { title: "Competitive pricing", body: "Exceptional value through cost-effective solutions without compromising quality." },
  { title: "Customer-centric approach", body: "We co-design with our clients to achieve outstanding results." },
  { title: "Customisation excellence", body: "Solutions tailored to each brand so your message comes through clearly." },
  { title: "Reliable delivery", body: "We ship on time, countrywide — order online and track every delivery." },
];

const CORE = [
  {
    title: "Custom packaging solutions",
    items: [
      "Branded woven and non-woven bags",
      "Luxury and premium kraft paper packaging",
      "Retail packaging solutions",
      "Custom labels and stickers",
    ],
    href: "/products" as const,
    search: {} as Record<string, string>,
  },
  {
    title: "Sustainable packaging",
    items: [
      "Eco-friendly packaging materials",
      "Recyclable and 100% biodegradable options",
      "Flexible packaging: polypropylene bags and pouches for food, beverage and cosmetics",
    ],
    href: "/products" as const,
    search: { category: "boxes" } as Record<string, string>,
  },
  {
    title: "Packaging design & consultation",
    items: [
      "Product presentation enhancement",
      "Packaging optimisation and cost-reduction strategies",
    ],
    href: "/enterprise-quote" as const,
    search: {} as Record<string, string>,
  },
];

const INDUSTRIES = [
  "Food & Beverage",
  "Fast-Moving Consumer Goods (FMCG)",
  "Wholesale & Retail",
  "Beauty & Personal Care",
  "Agriculture",
];

function CompanyProfilePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <div className="mx-auto max-w-7xl px-5 py-20 sm:py-28 lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.28em]" style={{ color: "var(--accent)" }}>
            Company Profile
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-tight text-white sm:text-5xl lg:text-6xl">
            Quality packaging <em className="italic" style={{ color: "var(--accent)" }}>for every moment.</em>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
            Moments Packaging (K) Ltd helps Kenyan brands present, protect and promote their products through
            innovative, high-quality and cost-effective packaging — delivered countrywide.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Browse our products <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={pdfAsset.url}
              download="Moments-Packaging-Company-Profile.pdf"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              <Download className="h-4 w-4" /> Download PDF
            </a>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-background">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:py-20 lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Introduction</p>
          <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
            A trusted packaging partner for Kenyan businesses.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-foreground/80">
            Moments Packaging is a customer-focused packaging solutions company based in Nairobi. We offer a wide
            range of supplies designed for everyday business needs across food, beverage, cosmetics, retail and more.
            With a focus on reliability, convenience and excellent service, we deliver innovative packaging
            countrywide — helping brands create memorable moments through great presentation.
          </p>
          <p className="mt-4 text-base leading-relaxed text-foreground/80">
            At Moments Packaging, we understand that packaging is more than a container — it&apos;s a powerful
            marketing tool that creates lasting first impressions, enhances brand visibility and influences
            purchasing decisions.
          </p>
        </div>
      </section>

      {/* Vision / Mission / Commitment */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                tag: "Vision",
                body:
                  "To redefine packaging across Africa and beyond through innovation, excellence and sustainable solutions that inspire business growth and memorable customer experiences.",
              },
              {
                tag: "Mission",
                body:
                  "To empower businesses through reliable, cost-effective and customised packaging solutions that enhance brand value, meet industry standards and drive sustainable growth.",
              },
              {
                tag: "Our commitment",
                body:
                  "Every package tells a story. We create solutions that protect products, strengthen brands, improve customer experience and drive business growth.",
              },
            ].map((c) => (
              <div key={c.tag} className="rounded-2xl border border-border bg-background p-7 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.25em] text-accent">{c.tag}</p>
                <p className="mt-4 text-sm leading-relaxed text-foreground/85">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Our values</p>
            <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
              What we stand for.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <v.Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Why choose us</p>
            <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Built to make your brand look its best — on time, every time.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w) => (
              <div key={w.title} className="rounded-2xl border border-border bg-background p-6">
                <Check className="h-5 w-5 text-accent" />
                <h3 className="mt-3 font-display text-base font-semibold text-foreground">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core products */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Our core products & services</p>
              <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
                Everything from a 100-bag pilot to a national rollout.
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
            >
              Browse the live catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {CORE.map((g) => (
              <div key={g.title} className="flex flex-col rounded-2xl border border-border bg-card p-7">
                <h3 className="font-display text-lg font-semibold text-foreground">{g.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {g.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={g.href}
                  search={g.search as never}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                >
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Industries we serve</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-medium text-foreground sm:text-4xl">
            Packaging tuned to your sector.
          </h2>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {INDUSTRIES.map((i) => (
              <span
                key={i}
                className="rounded-full border border-foreground/15 bg-background px-4 py-2 text-sm font-medium text-foreground"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">Contact us</p>
            <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Let&apos;s talk packaging.
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-start gap-3 rounded-xl border border-border p-4 hover:border-accent">
                <Phone className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{COMPANY_PHONE}</p>
                </div>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-xl border border-border p-4 hover:border-accent"
              >
                <MessageCircle className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</p>
                  <p className="font-medium text-foreground">{COMPANY_PHONE}</p>
                </div>
              </a>
              <a href={`mailto:${COMPANY_EMAIL}`} className="flex items-start gap-3 rounded-xl border border-border p-4 hover:border-accent">
                <Mail className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="break-all font-medium text-foreground">{COMPANY_EMAIL}</p>
                </div>
              </a>
              <div className="flex items-start gap-3 rounded-xl border border-border p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Address</p>
                  <p className="font-medium text-foreground">P.O. Box 16538-00100, Nairobi</p>
                  <p className="text-sm text-muted-foreground">Industrial Area, Nairobi</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border p-4 sm:col-span-2">
                <Globe className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Online</p>
                  <p className="font-medium text-foreground">www.momentspackaging.com · @momentspackaging</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/enterprise-quote"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                Request a quote <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={pdfAsset.url}
                download="Moments-Packaging-Company-Profile.pdf"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
              >
                <Download className="h-4 w-4" /> Download PDF version
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
