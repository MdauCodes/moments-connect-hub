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
  Instagram,
  Facebook,
  Recycle,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import pdfAsset from "@/assets/moments-company-profile.pdf.asset.json";
import coverImg from "@/assets/company-profile/cover.jpg.asset.json";
import visionImg from "@/assets/company-profile/vision-cups.jpg.asset.json";
import kraftImg from "@/assets/company-profile/kraft-solutions.jpg.asset.json";
import woodenImg from "@/assets/company-profile/wooden-products.jpg.asset.json";
import dessertImg from "@/assets/company-profile/dessert-cups.jpg.asset.json";
import bagsImg from "@/assets/company-profile/bags-sacks.jpg.asset.json";
import contactImg from "@/assets/company-profile/contact-products.jpg.asset.json";
import esgPoster1 from "@/assets/company-profile/esg-poster-1.jpg.asset.json";
import esgPoster2 from "@/assets/company-profile/esg-poster-2.png.asset.json";
import esgPoster3 from "@/assets/company-profile/esg-poster-3.png.asset.json";
import {
  COMPANY_EMAIL,
  COMPANY_PHONE,
  COMPANY_PHONE_ALT,
  COMPANY_ADDRESS,
  WHATSAPP_NUMBER,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  TIKTOK_URL,
  TIKTOK_HANDLE,
  FACEBOOK_URL,
  FACEBOOK_HANDLE,
} from "@/data/products";

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


function CompanyProfilePage() {
  return (
    <SiteLayout>
      {/* HERO — mirrors PDF cover */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{
          minHeight: "70dvh",
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

        <div className="relative mx-auto w-full max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr,1fr] lg:gap-14">
            <div>
              <h1 className="font-display text-5xl font-medium leading-[1.02] text-white sm:text-6xl lg:text-7xl">
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

            {/* Hero image — balances composition on the right */}
            <div className="relative hidden lg:block">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[2rem] opacity-40 blur-2xl"
                style={{ background: `linear-gradient(135deg, ${GOLD} 0%, transparent 65%)` }}
              />
              <div
                className="relative overflow-hidden rounded-[1.75rem] border p-2"
                style={{ borderColor: `${GOLD}55`, background: FOREST_DEEP }}
              >
                <img
                  src={coverImg.url}
                  alt="Moments Packaging product range"
                  className="block w-full rounded-[1.4rem] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US — first content section after hero */}
      <section className="relative" style={{ background: FOREST_DEEP }}>
        <div className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              About Us
            </p>
            <h2 className="mt-4 font-display text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
              A trusted packaging partner for Kenyan businesses.
            </h2>
            <div className="mt-5 flex items-center gap-3">
              <span className="block h-px w-12" style={{ background: GOLD }} />
              <Leaf className="h-4 w-4" style={{ color: GOLD }} />
              <span className="block h-px w-12" style={{ background: GOLD }} />
            </div>
            <p className="mt-6 text-lg leading-relaxed text-white/85">
              <span className="font-semibold" style={{ color: GOLD_SOFT }}>
                Moments Packaging (K) Ltd
              </span>{" "}
              is a customer-focused packaging solutions company based in Nairobi. We offer a wide
              range of supplies designed for everyday business needs across food, beverages,
              cosmetics, retail and more. With a focus on reliability, convenience and excellent
              customer service, we deliver innovative packaging countrywide while helping brands
              create memorable moments through great presentation.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-white/75">
              Packaging is more than a container — it is a powerful marketing tool that creates
              lasting first impressions, enhances brand visibility and influences purchasing
              decisions.
            </p>
          </div>
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

      {/* WHO WE SERVE — no matter the field, Moments is there */}
      <section className="relative" style={{ background: FOREST }}>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr,1.05fr] lg:items-center lg:px-8">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-3 rounded-3xl opacity-30 blur-2xl"
              style={{ background: `linear-gradient(135deg, ${GOLD} 0%, transparent 60%)` }}
            />
            <img
              src={kraftImg.url}
              alt="Why choose Moments Packaging"
              className="relative w-full rounded-2xl shadow-2xl"
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              Industries we serve
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-white sm:text-5xl">
              No matter the field,<br />
              <span style={{ color: GOLD_SOFT }}>Moments Packaging</span> is there to serve.
            </h2>
            <div className="mt-5 h-px w-16" style={{ background: GOLD }} />
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75">
              From everyday essentials to specialised supplies, we partner with businesses across
              Kenya in a wide range of sectors — bringing the same care, quality and reliability to
              every order.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Food & Beverage",
                "Wholesale & E-commerce",
                "Agriculture",
                "Cosmetics",
                "Stationery & General Supplies",
                "Kitchen Supplies",
              ].map((field) => (
                <li
                  key={field}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{ borderColor: `${GOLD}33`, background: FOREST_DEEP }}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rotate-45"
                    style={{ background: GOLD }}
                  />
                  <span className="text-sm font-medium text-white/90">{field}</span>
                </li>
              ))}
            </ul>
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

      {/* SUSTAINABILITY — ESG policy + posters (replaces Industries section) */}
      <section id="sustainability" className="relative" style={{ background: FOREST }}>
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              ESG &amp; Sustainability
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
              Packaging with purpose.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base italic text-white/80 sm:text-lg">
              Thoughtful Packaging. Responsible Future.
            </p>
            <div className="mx-auto mt-5 flex w-fit items-center gap-3">
              <span className="block h-px w-12" style={{ background: GOLD }} />
              <Recycle className="h-4 w-4" style={{ color: GOLD }} />
              <span className="block h-px w-12" style={{ background: GOLD }} />
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-4xl space-y-5 text-[16px] leading-relaxed text-white/85">
            <p>
              At Moments Packaging Ltd, sustainability is more than a business objective — it is a
              core value that shapes the way we design, source and deliver packaging solutions. The{" "}
              <span className="font-semibold" style={{ color: GOLD_SOFT }}>sprouting leaf</span> in
              our logo represents growth, renewal and a greener future, while the{" "}
              <span className="font-semibold" style={{ color: GOLD_SOFT }}>recycling symbol ♻️</span>{" "}
              embodies our belief in the circular economy.
            </p>
            <p>
              We actively promote environmentally responsible alternatives by expanding our range of
              Kraft packaging solutions that are eco-friendly, biodegradable, compostable and
              recyclable — helping our customers reduce their environmental footprint without
              compromising on quality.
            </p>
          </div>

          {/* 3 ESG pillars */}
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                Icon: Leaf,
                title: "Environmental Stewardship",
                body:
                  "Reducing waste, promoting recyclable and responsibly sourced materials, and supporting initiatives that conserve natural resources.",
              },
              {
                Icon: Users,
                title: "Social Responsibility",
                body:
                  "A safe, inclusive workplace. Long-term partnerships built on trust. Reliable products and exceptional service for local businesses.",
              },
              {
                Icon: ShieldCheck,
                title: "Ethical Governance",
                body:
                  "Transparency, accountability and integrity in every decision — complying with all applicable laws and continuously improving our ESG performance.",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border p-6"
                style={{ borderColor: `${GOLD}33`, background: FOREST_DEEP }}
              >
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border"
                  style={{ borderColor: `${GOLD}80`, color: GOLD }}
                >
                  <p.Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{p.body}</p>
              </div>
            ))}
          </div>

          {/* Poster gallery */}
          <div className="mt-14">
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Our ESG &amp; Sustainability Policy
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[esgPoster1, esgPoster2, esgPoster3].map((poster, i) => (
                <a
                  key={i}
                  href={poster.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-2xl border bg-white/5 transition-transform hover:-translate-y-1"
                  style={{ borderColor: `${GOLD}55` }}
                  aria-label={`Open ESG poster ${i + 1} in a new tab`}
                >
                  <img
                    src={poster.url}
                    alt={`Moments Packaging — ESG &amp; Sustainability Policy poster ${i + 1}`}
                    className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-white/60">
              Tap any poster to view full size — Together, we can package responsibly today and preserve tomorrow.
            </p>
          </div>
        </div>
      </section>



      {/* CONTACT — mirrors PDF page 21 */}
      <section className="relative" style={{ background: FOREST_DEEP }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              Get in touch
            </p>
            <h2 className="mt-3 font-display text-5xl font-medium text-white sm:text-6xl lg:text-7xl">
              Contact Us
            </h2>
            <div className="mt-6 h-px w-16" style={{ background: GOLD }} />

            <div className="mt-10 space-y-6">
              <ContactRow Icon={MapPin} label="Address">
                <p className="font-semibold text-lg" style={{ color: GOLD_SOFT }}>Moments Packaging (K) Ltd</p>
                <p className="text-lg">{COMPANY_ADDRESS}</p>
              </ContactRow>
              <ContactRow Icon={Phone} label="Phone">
                <p className="text-lg sm:text-xl font-semibold tracking-wide">
                  <a href={`tel:+${WHATSAPP_NUMBER}`} className="hover:underline">{COMPANY_PHONE}</a>
                  <span className="text-white/40"> / </span>
                  <a href="tel:+254119556699" className="hover:underline">{COMPANY_PHONE_ALT}</a>
                </p>
              </ContactRow>
              <ContactRow Icon={MessageCircle} label="WhatsApp">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg hover:underline"
                >
                  Chat on WhatsApp ({COMPANY_PHONE})
                </a>
              </ContactRow>
              <ContactRow Icon={Mail} label="Email">
                <a href={`mailto:${COMPANY_EMAIL}`} className="text-lg break-all hover:underline">
                  {COMPANY_EMAIL}
                </a>
              </ContactRow>
              <ContactRow Icon={Instagram} label="Instagram">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-lg hover:underline">
                  {INSTAGRAM_HANDLE}
                </a>
              </ContactRow>
              <ContactRow Icon={Facebook} label="Facebook">
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="text-lg hover:underline">
                  {FACEBOOK_HANDLE}
                </a>
              </ContactRow>
              <ContactRow Icon={Globe} label="TikTok">
                <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-lg hover:underline">
                  {TIKTOK_HANDLE}
                </a>
              </ContactRow>
              <ContactRow Icon={Globe} label="Online">
                <span className="text-lg">www.momentspackaging.com</span>
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
        <p className="text-[12px] font-semibold uppercase tracking-[0.28em]" style={{ color: GOLD }}>
          {label}
        </p>
        <div className="mt-1.5 text-base leading-relaxed text-white/90">{children}</div>
      </div>
    </div>
  );
}
