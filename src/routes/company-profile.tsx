import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Download,
  ArrowRight,
  Sparkles,
  Leaf,
  ShieldCheck,
  Users,
  Award,
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import pdfAsset from "@/assets/moments-company-profile.pdf.asset.json";
import logoAsset from "@/assets/moments-logo.png.asset.json";
import coverImg from "@/assets/company-profile/cover.jpg.asset.json";
import introImg from "@/assets/company-profile/intro.jpg.asset.json";
import visionImg from "@/assets/company-profile/vision-cups.jpg.asset.json";
import kraftImg from "@/assets/company-profile/kraft-solutions.jpg.asset.json";
import woodenImg from "@/assets/company-profile/wooden-products.jpg.asset.json";
import dessertImg from "@/assets/company-profile/dessert-cups.jpg.asset.json";
import bagsImg from "@/assets/company-profile/bags-sacks.jpg.asset.json";
import contactImg from "@/assets/company-profile/contact-products.jpg.asset.json";
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
      { property: "og:image", content: coverImg.url },
      { property: "og:url", content: "https://moments-demo.site/company-profile" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://moments-demo.site/company-profile" }],
  }),
  component: CompanyProfilePage,
});

// PDF brand tokens (forest green + gold)
const FOREST = "#0d3320";
const FOREST_DEEP = "#08231a";
const GOLD = "#c9a44c";
const GOLD_SOFT = "#e8c878";
const CREAM = "#f4ead6";

const VALUES = [
  { Icon: Award, title: "Excellence", body: "Highest standards in every customer interaction." },
  { Icon: Sparkles, title: "Innovation", body: "New ideas, technologies and packaging trends for superior solutions." },
  { Icon: ShieldCheck, title: "Integrity", body: "Business done with honesty, transparency and professionalism." },
  { Icon: Leaf, title: "Sustainability", body: "Environmentally responsible packaging for a greener future." },
  { Icon: Users, title: "Customer Success", body: "We measure success by the growth of our clients." },
];

const WHY = [
  { title: "Innovative Solutions", body: "Creative packaging concepts that help brands stand out in competitive markets." },
  { title: "Competitive Pricing", body: "Exceptional value through cost-effective solutions without compromising quality." },
  { title: "Customisation Excellence", body: "Solutions tailored to each client so your brand message comes through clearly." },
  { title: "Customer-Centric Approach", body: "Co-designed with our clients to achieve outstanding results." },
  { title: "Reliable Delivery", body: "On-time fulfilment countrywide — order online and track every delivery." },
];

const CORE = [
  {
    title: "Kraft Packaging Solutions",
    blurb: "Sustainable, durable, eco-friendly kraft food packaging — boats, sandwich boxes, carry bags, lunch boxes, window pouches, food containers, paper cups and trays.",
    image: kraftImg.url,
    href: "/products" as const,
    search: { category: "boxes" } as Record<string, string>,
  },
  {
    title: "Cups, Tumblers & Beverage Range",
    blurb: "Single-wall, double-wall and ripple paper cups, PET cold cups, dome and flat lids, branded tumblers and bubble-tea cups.",
    image: visionImg.url,
    href: "/products" as const,
    search: { category: "cups" } as Record<string, string>,
  },
  {
    title: "Dessert Cups & Display Glassware",
    blurb: "Trapeze, sundae, flower, oval, square, twisted, eye-lid, slanted and shooter cups for cafés, bakeries and caterers.",
    image: dessertImg.url,
    href: "/products" as const,
    search: { category: "cups" } as Record<string, string>,
  },
  {
    title: "Wooden & Bamboo Disposables",
    blurb: "Wooden cones, cutlery, teaspoons, skewers, stirrers, chopsticks, ice-cream sticks, cocktail picks and bamboo accessories.",
    image: woodenImg.url,
    href: "/products" as const,
    search: {} as Record<string, string>,
  },
  {
    title: "Bags & Sacks",
    blurb: "Woven and non-woven branded bags — V-series handle sacks, smart bags, 3D bags, vest bags, D-cut bags and bulk sacks.",
    image: bagsImg.url,
    href: "/products" as const,
    search: { category: "bags" } as Record<string, string>,
  },
];

const INDUSTRIES = [
  "Food & Beverage",
  "FMCG",
  "Wholesale & Retail",
  "Beauty & Personal Care",
  "Agriculture",
];

function CompanyProfilePage() {
  return (
    <SiteLayout>
      {/* HERO — mirrors PDF cover */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            `radial-gradient(ellipse at 100% 0%, ${FOREST} 0%, ${FOREST_DEEP} 60%, #061a13 100%)`,
        }}
      >
        {/* Decorative leaf accents */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, ${GOLD_SOFT} 0%, transparent 70%)` }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:py-28 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: GOLD }}
            >
              Moments Packaging (K) Ltd
            </p>
            <h1 className="mt-5 font-display text-5xl font-medium leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              Company<br />
              <span style={{ color: "#ffffff" }}>Profile</span>
            </h1>
            <div className="mt-6 h-px w-16" style={{ background: GOLD }} />
            <p
              className="mt-6 max-w-md font-display text-xl font-light italic leading-snug"
              style={{ color: GOLD_SOFT }}
            >
              Quality packaging <span className="text-white/90">for every moment.</span>
            </p>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75">
              We help Kenyan brands present, protect and promote their products through innovative,
              high-quality and cost-effective packaging — delivered countrywide.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
                style={{ background: GOLD, color: FOREST_DEEP }}
              >
                Browse our products <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={pdfAsset.url}
                download="Moments-Packaging-Company-Profile.pdf"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
                style={{ borderColor: `${GOLD}66` }}
              >
                <Download className="h-4 w-4" /> Download PDF
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t pt-8" style={{ borderColor: `${GOLD}33` }}>
              {[
                { Icon: Leaf, label: "Quality\nPackaging" },
                { Icon: ShieldCheck, label: "Sustainable\nSolutions" },
                { Icon: Users, label: "For Every\nMoment" },
              ].map((b) => (
                <div key={b.label} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                    style={{ borderColor: `${GOLD}80`, color: GOLD }}
                  >
                    <b.Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="whitespace-pre-line text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-3 rounded-3xl opacity-40 blur-2xl"
              style={{ background: `linear-gradient(135deg, ${GOLD} 0%, transparent 70%)` }}
            />
            <img
              src={coverImg.url}
              alt="Moments Packaging — Company Profile cover"
              className="relative w-full rounded-2xl shadow-2xl ring-1"
              style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)" }}
            />
          </div>
        </div>
      </section>

      {/* INTRODUCTION — green theme continues */}
      <section className="relative" style={{ background: FOREST_DEEP }}>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              Introduction
            </p>
            <h2 className="mt-4 font-display text-4xl font-medium text-white sm:text-5xl">
              A trusted packaging partner for Kenyan businesses.
            </h2>
            <div className="mt-5 flex items-center gap-3">
              <span className="block h-px w-12" style={{ background: GOLD }} />
              <Leaf className="h-4 w-4" style={{ color: GOLD }} />
              <span className="block h-px w-12" style={{ background: GOLD }} />
            </div>
            <p className="mt-6 text-[15px] leading-relaxed text-white/80">
              <span className="font-semibold" style={{ color: GOLD_SOFT }}>
                Moments Packaging
              </span>{" "}
              is a customer-focused packaging solutions company based in Nairobi. We offer a wide
              range of supplies designed for everyday business needs across food, beverages,
              cosmetics, retail and more. With a focus on reliability, convenience and excellent
              customer service, we deliver innovative packaging countrywide while helping brands
              create memorable moments through great presentation.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Packaging is more than a container — it is a powerful marketing tool that creates
              lasting first impressions, enhances brand visibility and influences purchasing
              decisions.
            </p>
          </div>
          <img
            src={introImg.url}
            alt="Moments Packaging introduction"
            className="w-full rounded-2xl shadow-2xl"
          />
        </div>
      </section>

      {/* VISION / MISSION / COMMITMENT */}
      <section className="relative" style={{ background: FOREST }}>
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-12">
            <img src={visionImg.url} alt="Vision — Moments cups range" className="w-full rounded-2xl shadow-2xl" />
            <div className="grid gap-5">
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
                  tag: "Our Commitment",
                  body:
                    "Every package tells a story. We create solutions that protect products, strengthen brands, improve customer experience and drive business growth.",
                },
              ].map((c) => (
                <div
                  key={c.tag}
                  className="rounded-2xl border p-6"
                  style={{ borderColor: `${GOLD}33`, background: `${FOREST_DEEP}` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-2 w-2 rotate-45"
                      style={{ background: GOLD }}
                    />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                      {c.tag}
                    </p>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/85">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="relative" style={{ background: FOREST_DEEP }}>
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              Our Values
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium text-white sm:text-5xl">
              What we stand for.
            </h2>
            <div className="mx-auto mt-5 flex w-fit items-center gap-3">
              <span className="block h-px w-12" style={{ background: GOLD }} />
              <Leaf className="h-4 w-4" style={{ color: GOLD }} />
              <span className="block h-px w-12" style={{ background: GOLD }} />
            </div>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="group rounded-2xl border p-6 transition-colors"
                style={{ borderColor: `${GOLD}33`, background: FOREST }}
              >
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border"
                  style={{ borderColor: `${GOLD}80`, color: GOLD }}
                >
                  <v.Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US — mirrors page 5 of PDF */}
      <section className="relative" style={{ background: FOREST }}>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr,1.2fr] lg:items-center lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              Why Choose Us
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium uppercase leading-tight text-white sm:text-5xl">
              Why choose<br />us?
            </h2>
            <img
              src={dessertImg.url}
              alt="Dessert cups range"
              className="mt-8 hidden w-full rounded-2xl shadow-2xl lg:block"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {WHY.map((w) => (
              <div key={w.title} className="flex gap-3">
                <span
                  className="mt-1 inline-block h-3 w-3 shrink-0 rotate-45"
                  style={{ background: GOLD }}
                />
                <div className="border-b pb-4" style={{ borderColor: `${GOLD}33` }}>
                  <h3 className="font-display text-base font-semibold text-white">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{w.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE PRODUCTS — image + text rows, like PDF product showcases */}
      <section className="relative" style={{ background: FOREST_DEEP }}>
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              Core Products & Services
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium uppercase text-white sm:text-5xl">
              The Moments range
            </h2>
            <div className="mx-auto mt-5 flex w-fit items-center gap-3">
              <span className="block h-px w-12" style={{ background: GOLD }} />
              <Leaf className="h-4 w-4" style={{ color: GOLD }} />
              <span className="block h-px w-12" style={{ background: GOLD }} />
            </div>
          </div>

          <div className="mt-14 space-y-14">
            {CORE.map((c, i) => (
              <div
                key={c.title}
                className={`grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative">
                  <div
                    className="absolute -inset-2 rounded-2xl opacity-30 blur-xl"
                    style={{ background: `linear-gradient(135deg, ${GOLD} 0%, transparent 60%)` }}
                  />
                  <img
                    src={c.image}
                    alt={c.title}
                    className="relative w-full rounded-2xl shadow-2xl"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: GOLD }}>
                    0{i + 1} · Range
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                    {c.title}
                  </h3>
                  <div className="mt-4 h-px w-12" style={{ background: GOLD }} />
                  <p className="mt-5 text-[15px] leading-relaxed text-white/75">{c.blurb}</p>
                  <Link
                    to={c.href}
                    search={c.search as never}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/5"
                    style={{ borderColor: GOLD, color: GOLD }}
                  >
                    Explore the range <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="relative" style={{ background: FOREST }}>
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              Industries We Serve
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium text-white sm:text-5xl">
              Packaging tuned to your sector.
            </h2>
          </div>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
            {INDUSTRIES.map((i) => (
              <span
                key={i}
                className="rounded-full border px-5 py-2.5 text-sm font-medium text-white"
                style={{ borderColor: `${GOLD}80`, background: `${FOREST_DEEP}` }}
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT — mirrors PDF page 21 */}
      <section className="relative" style={{ background: FOREST_DEEP }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              Get in touch
            </p>
            <h2 className="mt-3 font-display text-5xl font-medium text-white sm:text-6xl">
              Contact Us
            </h2>
            <div className="mt-6 h-px w-16" style={{ background: GOLD }} />

            <div className="mt-10 space-y-5">
              <ContactRow Icon={MapPin} label="Address">
                <p className="font-semibold" style={{ color: GOLD_SOFT }}>Moments Packaging</p>
                <p>P.O. Box 16538 — 00100, Nairobi · Industrial Area</p>
              </ContactRow>
              <ContactRow Icon={Phone} label="Phone">
                <a href={`tel:+${WHATSAPP_NUMBER}`} className="hover:underline">{COMPANY_PHONE}</a>
              </ContactRow>
              <ContactRow Icon={MessageCircle} label="WhatsApp">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Chat on WhatsApp
                </a>
              </ContactRow>
              <ContactRow Icon={Mail} label="Email">
                <a href={`mailto:${COMPANY_EMAIL}`} className="break-all hover:underline">
                  {COMPANY_EMAIL}
                </a>
              </ContactRow>
              <ContactRow Icon={Globe} label="Online">
                www.momentspackaging.com · @momentspackaging
              </ContactRow>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/enterprise-quote"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{ background: GOLD, color: FOREST_DEEP }}
              >
                Request a quote <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={pdfAsset.url}
                download="Moments-Packaging-Company-Profile.pdf"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium text-white hover:bg-white/5"
                style={{ borderColor: `${GOLD}80` }}
              >
                <Download className="h-4 w-4" /> Download PDF
              </a>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl border p-3 sm:p-4"
            style={{ borderColor: `${GOLD}55` }}
          >
            <img
              src={contactImg.url}
              alt="Moments Packaging product showcase"
              className="w-full rounded-2xl"
            />
          </div>
        </div>

        {/* Subtle gold corner accent like PDF */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-32 w-1/2"
          style={{
            background: `linear-gradient(135deg, transparent 50%, ${GOLD}33 50%, ${GOLD}22 70%, transparent 100%)`,
          }}
        />
      </section>

      {/* Closing strip */}
      <section className="relative" style={{ background: FOREST }}>
        <div className="mx-auto max-w-5xl px-5 py-14 text-center lg:px-8">
          <p
            className="font-display text-2xl font-light italic"
            style={{ color: GOLD_SOFT }}
          >
            Quality packaging <span className="text-white">for every moment.</span>
          </p>
          <div className="mx-auto mt-5 flex w-fit items-center gap-3">
            <span className="block h-px w-12" style={{ background: GOLD }} />
            <Leaf className="h-4 w-4" style={{ color: GOLD }} />
            <span className="block h-px w-12" style={{ background: GOLD }} />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function ContactRow({
  Icon,
  label,
  children,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
        style={{ borderColor: `${GOLD}80`, color: GOLD }}
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: GOLD }}>
          {label}
        </p>
        <div className="mt-1 text-[15px] leading-relaxed text-white/85">{children}</div>
      </div>
    </div>
  );
}
