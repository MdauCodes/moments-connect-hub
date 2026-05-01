import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductDetailSkeleton } from "@/components/ProductDetailSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { ConfiguratorModal } from "@/components/ConfiguratorModal";
import type { Product } from "@/data/products";
import { api } from "@/services/api";
import { apiUrl } from "@/config/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const product = await api.getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product — Moments Packaging" }] };
    const image = p.primaryImageUrl ?? p.image;
    return {
      meta: [
        { title: `${p.name} — Moments Packaging Kenya` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — Moments Packaging Kenya` },
        { property: "og:description", content: p.description },
        { property: "og:image", content: image },
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
        <p className="mt-4 text-muted-foreground">
          The product you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Browse products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SiteLayout>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const wishlist = useWishlist();

  // Gallery
  const allImages = useMemo(() => {
    const list = [
      product.primaryImageUrl ?? product.image,
      ...(product.imageUrls ?? product.images ?? []),
    ].filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);
  const [activeImage, setActiveImage] = useState(allImages[0]);

  // Configurator state
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [material, setMaterial] = useState(
    product.materials?.[0] ?? product.material ?? "",
  );
  const [finish, setFinish] = useState(product.finish ?? "Standard");
  const [qty, setQty] = useState(product.moq);
  const [qtyError, setQtyError] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const saved = wishlist.has(product.id);
  const [configuring, setConfiguring] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);

  const enterprise = product.moq >= 10000;

  // Active pricing tier and unit price
  const tiers = product.pricingTiers ?? [];
  const activeTier = useMemo(
    () =>
      tiers.find(
        (t) => qty >= t.minQty && (t.maxQty === undefined || qty <= t.maxQty),
      ) ?? tiers[tiers.length - 1],
    [tiers, qty],
  );
  const unitPrice = activeTier?.pricePerUnit ?? product.basePrice ?? 0;
  const lineTotal = qty * unitPrice;

  // Click tracking on mount
  useEffect(() => {
    fetch(apiUrl(`/api/v1/public/products/${encodeURIComponent(product.id)}/click`), {
      method: "POST",
    }).catch(() => {
      /* fire and forget */
    });
  }, [product.id]);

  // Related: recommended endpoint
  useEffect(() => {
    let cancelled = false;
    api
      .getRecommended()
      .then((data) => {
        if (cancelled) return;
        setRelated(data.filter((p) => p.id !== product.id).slice(0, 4));
      })
      .catch(() => setRelated([]));
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const handleQty = (v: string) => {
    const n = Number(v);
    if (Number.isNaN(n)) return;
    setQty(n);
    setQtyError(n < product.moq ? `Minimum order is ${product.moq.toLocaleString()} units` : null);
  };

  const handleAddToCart = () => {
    if (enterprise) {
      navigate({ to: "/enterprise-quote" });
      return;
    }
    if (qty < product.moq) {
      setQtyError(`Minimum order is ${product.moq.toLocaleString()} units`);
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      primaryImageUrl: product.primaryImageUrl ?? product.image,
      size: size || "Standard",
      material: material || "Standard",
      finish: finish || "Standard",
      quantity: qty,
      unitPrice,
    });
    toast.success("Added to cart", { duration: 2000 });
  };

  const handleWishlist = async () => {
    const nowSaved = await wishlist.toggle(product.id);
    toast.success(nowSaved ? "Saved to wishlist" : "Removed from wishlist");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  const productIndustries = product.industries ?? [];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to catalogue
        </Link>
      </div>

      {/* Breadcrumb */}
      <nav className="mx-auto max-w-7xl px-5 pt-4 text-xs text-muted-foreground lg:px-8">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <Link to="/products" className="hover:text-foreground">Products</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground/80">{product.category}</span>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:gap-10 sm:py-10 lg:grid-cols-5 lg:gap-12 lg:px-8 lg:py-12">
        {/* LEFT — gallery (60%) */}
        <div className="lg:col-span-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.isNewArrival && (
                <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  New
                </span>
              )}
              {product.isDiscount && (
                <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                  -{product.discountPercent ?? 10}%
                </span>
              )}
              {product.isFastMoving && (
                <span className="rounded-full bg-kraft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-kraft-foreground">
                  Hot
                </span>
              )}
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto">
              {allImages.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === img ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — info + configurator (40%) */}
        <div className="lg:col-span-2">
          {productIndustries.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {productIndustries.map((ind) => (
                <span
                  key={String(ind.id ?? ind.slug)}
                  className="rounded-full border border-kraft/30 bg-kraft/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-kraft"
                >
                  {ind.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-display text-2xl font-medium text-foreground sm:text-3xl lg:text-[2rem]">
            {product.name}
          </h1>

          <div className="mt-3">
            <p
              className={`text-sm text-muted-foreground sm:text-base ${
                descExpanded ? "" : "line-clamp-3"
              }`}
            >
              {product.description}
            </p>
            {product.description && product.description.length > 160 && (
              <button
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
                className="mt-1 text-xs font-medium text-accent hover:underline"
              >
                {descExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Pricing */}
          <div className="mt-6">
            {tiers.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-2 bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  <span>Quantity</span>
                  <span className="text-right">Price per unit</span>
                </div>
                {tiers.map((t) => {
                  const isActive = t === activeTier;
                  return (
                    <div
                      key={`${t.minQty}-${t.maxQty ?? "max"}`}
                      className={`grid grid-cols-2 px-4 py-2 text-sm ${
                        isActive ? "bg-cream font-semibold text-foreground" : "text-foreground/80"
                      }`}
                    >
                      <span>
                        {t.minQty.toLocaleString()}
                        {t.maxQty ? `–${t.maxQty.toLocaleString()}` : "+"}
                      </span>
                      <span className="text-right">KES {t.pricePerUnit.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            ) : product.basePrice ? (
              <p className="font-display text-2xl text-foreground">
                KES {product.basePrice.toLocaleString()}
                <span className="ml-2 text-sm font-normal text-muted-foreground">per unit</span>
              </p>
            ) : (
              <p className="font-display text-2xl text-foreground">Price on request</p>
            )}
          </div>

          {/* Configurator */}
          <div className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-5">
            {product.sizes && product.sizes.length > 0 && (
              <ConfigField label="Size">
                <PillGroup options={product.sizes} value={size} onChange={setSize} />
              </ConfigField>
            )}
            {(product.materials?.length ?? 0) > 0 && (
              <ConfigField label="Material">
                <PillGroup
                  options={product.materials!}
                  value={material}
                  onChange={setMaterial}
                />
              </ConfigField>
            )}
            {finish && (
              <ConfigField label="Finish">
                <PillGroup options={[finish]} value={finish} onChange={setFinish} />
              </ConfigField>
            )}

            <ConfigField
              label="Quantity"
              note={`(Min. ${product.moq.toLocaleString()} units)`}
            >
              <input
                type="number"
                min={product.moq}
                step={1}
                value={qty}
                onChange={(e) => handleQty(e.target.value)}
                onBlur={() => {
                  if (qty < product.moq) setQty(product.moq);
                  setQtyError(null);
                }}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {qtyError && <p className="mt-1.5 text-xs text-accent">{qtyError}</p>}
            </ConfigField>

            <div className="rounded-xl bg-primary px-5 py-4 text-primary-foreground">
              {unitPrice > 0 ? (
                <p className="text-sm">
                  {qty.toLocaleString()} × KES {unitPrice.toLocaleString()} ={" "}
                  <span className="font-display text-lg font-semibold">
                    KES {lineTotal.toLocaleString()}
                  </span>
                </p>
              ) : (
                <p className="text-sm">Price calculated on order — our team will confirm.</p>
              )}
            </div>

            <span className="inline-flex items-center rounded-full bg-cream px-3 py-1 text-xs text-foreground">
              Production: 7–14 business days
            </span>

            {enterprise ? (
              <button
                type="button"
                onClick={() => navigate({ to: "/enterprise-quote" })}
                className="h-[52px] w-full rounded-full border border-primary text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Request enterprise quote →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="h-[52px] w-full rounded-full bg-accent text-sm font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Add to cart
              </button>
            )}

            <div className="flex items-center justify-center gap-6 pt-1 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={handleWishlist}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-accent text-accent" : ""}`} />
                Save
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>

          {/* Trust chips */}
          <ul className="mt-5 flex flex-wrap gap-2 text-xs text-foreground/70">
            <li className="rounded-full border border-border bg-cream px-3 py-1">
              ✓ Secure M-Pesa checkout
            </li>
            <li className="rounded-full border border-border bg-cream px-3 py-1">
              ✓ 7–14 day production
            </li>
            <li className="rounded-full border border-border bg-cream px-3 py-1">
              ✓ Custom branding included
            </li>
          </ul>
        </div>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-7xl px-5 pb-12 lg:px-8">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="bg-cream">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="sizes">Sizes & Specs</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              {product.material && (
                <DetailRow label="Material" value={product.material} />
              )}
              {product.finish && <DetailRow label="Finish" value={product.finish} />}
              {product.tags && product.tags.length > 0 && (
                <DetailRow label="Tags" value={product.tags.join(", ")} />
              )}
              {product.keywords && product.keywords.length > 0 && (
                <DetailRow label="Keywords" value={product.keywords.join(", ")} />
              )}
            </dl>
          </TabsContent>

          <TabsContent value="sizes" className="mt-6">
            {product.sizes && product.sizes.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-2 bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  <span>Size</span>
                  <span>Description</span>
                </div>
                {product.sizes.map((s) => (
                  <div key={s} className="grid grid-cols-2 border-t border-border px-4 py-2 text-sm">
                    <span className="font-medium text-foreground">{s}</span>
                    <span className="text-muted-foreground">Standard {product.category}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sizes available on request.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <div className="flex justify-center gap-1 text-foreground/30">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-5 w-5" />
                ))}
              </div>
              <p className="mt-3 font-display text-lg text-foreground">
                No reviews yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first after your order arrives.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:pb-24 lg:px-8">
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">
            You might also like
          </h2>
          <div className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onConfigure={setConfiguring} />
            ))}
          </div>
        </section>
      )}

      <ConfiguratorModal product={configuring} onClose={() => setConfiguring(null)} />
    </SiteLayout>
  );
}

function ConfigField({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {note && (
          <span className="ml-1 font-normal normal-case tracking-normal text-foreground/60">
            {note}
          </span>
        )}
      </p>
      {children}
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground/20 bg-cream text-foreground hover:border-foreground/40"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}
