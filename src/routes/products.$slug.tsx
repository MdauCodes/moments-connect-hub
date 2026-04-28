import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductDetailSkeleton } from "@/components/ProductDetailSkeleton";
import { products, productOrderMessage, whatsappLink } from "@/data/products";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const product = await api.getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product — Moments Packaging" }] };
    return {
      meta: [
        { title: `${p.name} — Moments Packaging Kenya` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — Moments Packaging Kenya` },
        { property: "og:description", content: p.description },
        { property: "og:image", content: p.image },
      ],
    };
  },
  pendingComponent: () => (
    <SiteLayout>
      <ProductDetailSkeleton />
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-32 text-center lg:px-8">
        <h1 className="font-display text-5xl">Product not found</h1>
        <p className="mt-4 text-muted-foreground">The product you're looking for doesn't exist or has been moved.</p>
        <Link to="/products" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">
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
  useEffect(() => {
    void api.trackClick(product.id);
  }, [product.id]);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 pt-8 lg:px-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to catalogue
        </Link>
      </div>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:gap-12 sm:py-10 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-3xl border border-border bg-secondary">
          <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">{product.name}</h1>
          <p className="mt-4 text-base text-muted-foreground sm:mt-5 sm:text-lg">{product.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-6">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Minimum order</dt>
              <dd className="mt-1 font-display text-2xl text-foreground">{product.moq.toLocaleString()} units</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Lead time</dt>
              <dd className="mt-1 font-display text-2xl text-foreground">7–14 days</dd>
            </div>
          </dl>

          <div className="mt-8">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Choose size / variant</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all ${
                    size === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Estimated quantity</label>
            <input
              type="number"
              min={product.moq}
              step={50}
              value={qty}
              onChange={(e) => setQty(Math.max(product.moq, Number(e.target.value) || product.moq))}
              className="mt-3 block w-40 rounded-lg border border-input bg-background px-4 py-2.5 font-display text-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={orderHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-4 text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-7 py-4 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Request a custom quote
            </Link>
          </div>

          <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
            {["Custom 1–4 colour print", "Logo embossing & foiling available", "Food-safe materials"].map((b) => (
              <li key={b} className="inline-flex w-full items-center gap-2">
                <Check className="h-4 w-4 text-accent" /> {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:pb-24 lg:px-8">
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">You may also like</h2>
          <div className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-3 sm:gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[5/4] overflow-hidden bg-secondary">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-foreground">{p.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">MOQ {p.moq.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
