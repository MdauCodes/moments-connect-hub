import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { DivisionBadge } from "@/components/DivisionBadge";
import { products, productOrderMessage, whatsappLink, divisions } from "@/data/products";
import { useState } from "react";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product — Moments Packaging Kenya" }] };
    return {
      meta: [
        { title: `${p.name} — Moments Packaging Kenya` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — Moments Packaging Kenya` },
        { property: "og:description", content: p.description },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-32 text-center lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Error 404</p>
        <h1 className="mt-3 font-display text-5xl">Product not found</h1>
        <p className="mt-4 text-muted-foreground">
          The product you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to catalogue
        </Link>
      </div>
    </SiteLayout>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(product.moq);

  const orderHref = whatsappLink(productOrderMessage(product, size, qty));
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const accent = product.division === "food" ? "var(--clay)" : "var(--forest)";

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link
            to="/products"
            search={{ division: product.division }}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to {divisions[product.division].label.toLowerCase()}
          </Link>
          <DivisionBadge division={product.division} />
        </div>
      </div>

      {/* Hero spec block — typographic */}
      <section className="border-b border-border bg-cream">
        <div className="grain absolute inset-x-0 h-[600px] opacity-30" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-20">
          {/* Visual code block */}
          <div className="lg:col-span-5">
            <div
              className="relative aspect-square w-full border border-border"
              style={{ backgroundColor: accent }}
            >
              <div className="grain absolute inset-0 opacity-20" aria-hidden />
              <div className="relative flex h-full flex-col justify-between p-8 text-background lg:p-10">
                <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-background/70">
                  <span>Ref · {product.id.toUpperCase()}</span>
                  <span>{product.code}</span>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/70">
                    {divisions[product.division].label}
                  </p>
                  <p className="mt-3 font-display text-7xl font-medium leading-none sm:text-8xl">
                    {product.code}
                  </p>
                  <p className="mt-6 font-display text-xl text-background/85">{product.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spec column */}
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {divisions[product.division].label}
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">{product.description}</p>

            {/* Spec table — editorial */}
            <dl className="mt-10 grid grid-cols-2 gap-px border border-border bg-border">
              <div className="bg-background p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Minimum order
                </dt>
                <dd className="mt-2 font-display text-3xl font-medium text-foreground">
                  {product.moq.toLocaleString()}
                </dd>
              </div>
              <div className="bg-background p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Lead time
                </dt>
                <dd className="mt-2 font-display text-3xl font-medium text-foreground">7–14 days</dd>
              </div>
              <div className="bg-background p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Available variants
                </dt>
                <dd className="mt-2 font-display text-3xl font-medium text-foreground">
                  {product.sizes.length}
                </dd>
              </div>
              <div className="bg-background p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Category
                </dt>
                <dd className="mt-2 font-display text-xl text-foreground">{product.category}</dd>
              </div>
            </dl>

            {/* Variant + qty */}
            <div className="mt-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Choose size / variant
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`border px-4 py-2 text-sm transition-colors ${
                      size === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Estimated quantity
              </p>
              <input
                type="number"
                min={product.moq}
                step={50}
                value={qty}
                onChange={(e) => setQty(Math.max(product.moq, Number(e.target.value) || product.moq))}
                className="mt-3 block w-44 border border-input bg-background px-4 py-2.5 font-display text-xl focus:border-foreground focus:outline-none"
              />
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={orderHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] px-7 py-4 text-sm font-medium text-white"
              >
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-foreground bg-background px-7 py-4 text-sm font-medium text-foreground hover:bg-foreground hover:text-background"
              >
                Request a custom quote
              </Link>
            </div>

            <ul className="mt-8 space-y-2.5 text-sm text-muted-foreground">
              {[
                "Custom 1–4 colour print",
                "Logo embossing & foiling available",
                product.division === "food" ? "Food-safe materials" : "Custom branding & artwork",
              ].map((b) => (
                <li key={b} className="inline-flex w-full items-center gap-2.5">
                  <Check className="h-4 w-4 text-[color:var(--clay)]" /> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <div className="flex items-end justify-between border-b border-border pb-6">
              <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
                Also in this category
              </h2>
              <Link
                to="/products"
                search={{ division: product.division, category: product.category }}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground"
              >
                View all →
              </Link>
            </div>
            <ul className="border-b border-border">
              {related.map((p) => (
                <li key={p.id}>
                  {/* Reuse same ProductCard look — inline import would cycle, so a simplified row */}
                  <Link
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    className="group block border-t border-border bg-background py-7 transition-colors hover:bg-secondary/40"
                  >
                    <div className="flex items-start gap-6 px-5">
                      <div
                        className="grid h-16 w-16 shrink-0 place-items-center font-display text-2xl text-background"
                        style={{
                          backgroundColor: p.division === "food" ? "var(--clay)" : "var(--forest)",
                        }}
                      >
                        {p.code}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-xl text-foreground">{p.name}</h3>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          MOQ {p.moq.toLocaleString()} · {p.sizes.length} variants
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
