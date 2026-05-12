import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Heart, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductDetailSkeleton } from "@/components/ProductDetailSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { ConfiguratorModal } from "@/components/ConfiguratorModal";
import { ProductReviews } from "@/components/ProductReviews";
import type { Product } from "@/data/products";
import { api } from "@/services/api";
import { apiUrl } from "@/config/api";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { getStockInfo } from "@/lib/stock";
import { reviewStore } from "@/services/reviewStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const product = await api.getProductBySlug(params.slug);
    if (!product) throw notFound();
    // Best-effort review summary for AggregateRating JSON-LD; never blocks rendering.
    let reviewSummary: { count: number; average: number } | null = null;
    try {
      const { summary } = await reviewStore.listForProduct(product.slug);
      if (summary.count > 0) reviewSummary = { count: summary.count, average: summary.average };
    } catch {
      /* ignore */
    }
    return { product, reviewSummary };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const reviewSummary = loaderData?.reviewSummary;
    if (!p) return { meta: [{ title: "Product — Moments Packaging" }] };
    const image = p.primaryImageUrl ?? p.image;
    const url = `https://www.momentspackaging.com/products/${p.slug}`;
    const tracked = p.trackInventory ?? typeof p.stock === "number";
    const inStock = !tracked || (p.stock ?? 0) > 0;
    const ld: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.description,
      image: [image],
      sku: p.sku ?? p.id,
      brand: { "@type": "Brand", name: "Moments Packaging" },
      category: p.category,
      offers: p.basePrice
        ? {
            "@type": "Offer",
            url,
            priceCurrency: "KES",
            price: p.basePrice,
            availability: inStock ? "https://schema.org/InStock" : "https://schema.org/BackOrder",
            itemCondition: "https://schema.org/NewCondition",
          }
        : undefined,
    };
    if (reviewSummary && reviewSummary.count > 0) {
      ld.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: reviewSummary.average,
        reviewCount: reviewSummary.count,
        bestRating: 5,
        worstRating: 1,
      };
    }
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.momentspackaging.com/" },
        { "@type": "ListItem", position: 2, name: "Products", item: "https://www.momentspackaging.com/products" },
        { "@type": "ListItem", position: 3, name: p.name, item: url },
      ],
    };
    return {
      meta: [
        { title: `${p.name} — Moments Packaging Kenya` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.name} — Moments Packaging Kenya` },
        { property: "og:description", content: p.description },
        { property: "og:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(ld) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
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
  const wishlist = useWishlist();

  // Gallery
  const allImages = useMemo(() => {
    const list = [product.primaryImageUrl ?? product.image, ...(product.imageUrls ?? product.images ?? [])].filter(
      Boolean,
    );
    return Array.from(new Set(list));
  }, [product]);
  const [activeImage, setActiveImage] = useState(allImages[0]);

  // Variants take precedence — when present, drive price/sku/stock.
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState<string | undefined>(variants[0]?.id ?? variants[0]?.label);
  const activeVariant = useMemo(
    () => variants.find((v: any) => (v.id ?? v.label) === variantId) ?? (variants.length > 0 ? variants[0] : undefined),
    [variants, variantId],
  );

  // Configurator state
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [material, setMaterial] = useState(product.materials?.[0] ?? product.material ?? "");
  const [finish, setFinish] = useState(product.finish ?? "Standard");
  const [qty, setQty] = useState(product.moq);
  const [qtyError, setQtyError] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const saved = wishlist.has(product.id);
  const [configuring, setConfiguring] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);

  const enterprise = product.moq >= 10000;

  // ── Pricing tiers ──────────────────────────────────────────────────────────
  const tiers = product.pricingTiers ?? [];
  const collectionTiers = useMemo(
    () =>
      tiers
        .filter((t: any) => t.collectionName && t.quantity)
        .slice()
        .sort((a: any, b: any) => (a.sortOrder ?? a.quantity) - (b.sortOrder ?? b.quantity)),
    [tiers],
  );
  const hasCollections = collectionTiers.length > 0;
  const individualEnabled = product.individualSalesEnabled === true;

  // selectedTierId = null  → individual units
  // selectedTierId = "id"  → that tier
  const [selectedTierId, setSelectedTierId] = useState<string | null>(() => {
    if (hasCollections) return (collectionTiers[0] as any).id ?? `tier-0`;
    return null;
  });
  const selectedTier =
    hasCollections && selectedTierId
      ? (collectionTiers.find((t: any) => (t.id ?? `tier-${collectionTiers.indexOf(t)}`) === selectedTierId) as any)
      : null;

  // Legacy quantity-bracket tier (mock data only — when no collection tiers).
  const legacyTier = useMemo(
    () =>
      !hasCollections
        ? ((tiers as any[]).find((t) => qty >= (t.minQty ?? 0) && (t.maxQty === undefined || qty <= t.maxQty)) ??
          tiers[tiers.length - 1])
        : null,
    [tiers, qty, hasCollections],
  );

  // Variant price overrides tier price when present.
  const unitPrice = selectedTier
    ? Number(selectedTier.pricePerUnit) || 0
    : (activeVariant?.price ?? (legacyTier as any)?.pricePerUnit ?? product.basePrice ?? 0);
  const collectionQty = selectedTier ? Number(selectedTier.quantity) || 0 : 0;
  const collectionPrice = selectedTier ? Number(selectedTier.collectionPrice ?? unitPrice * collectionQty) || 0 : 0;
  const lineTotal = selectedTier ? qty * collectionPrice : qty * unitPrice;

  const stock = useMemo(() => getStockInfo(product, activeVariant, qty), [product, activeVariant, qty]);

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

  const minQty = selectedTier ? 1 : product.moq;

  const handleQty = (v: string) => {
    const n = Number(v);
    if (Number.isNaN(n)) return;
    setQty(n);
    setQtyError(n < minQty ? `Minimum: ${minQty.toLocaleString()}` : null);
  };

  const handleSelectTier = (tierKey: string | null) => {
    setSelectedTierId(tierKey);
    setQty(tierKey ? 1 : product.moq);
    setQtyError(null);
  };

  const handleAddToCart = () => {
    if (enterprise) {
      navigate({ to: "/enterprise-quote" });
      return;
    }
    if (qty < minQty) {
      setQtyError(`Minimum: ${minQty.toLocaleString()}`);
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
      unitPrice: selectedTier ? Number(selectedTier.pricePerUnit) : unitPrice,
      variantId: activeVariant?.id ?? activeVariant?.label,
      variantLabel: activeVariant?.label,
      sku: activeVariant?.sku ?? product.sku,
      isBackorder: stock.isBackorder,
      tierId: selectedTier ? selectedTierId : null,
      collectionName: selectedTier?.collectionName,
      collectionQuantity: selectedTier ? collectionQty : undefined,
      totalUnits: selectedTier ? qty * collectionQty : qty,
    });
    toast.success(stock.isBackorder ? "Added — backorder (extended lead time)" : "Added to cart", { duration: 2400 });
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
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground/80">{product.category}</span>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:gap-10 sm:py-10 lg:grid-cols-5 lg:gap-12 lg:px-8 lg:py-12">
        {/* LEFT — gallery (60%) */}
        <div className="lg:col-span-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
            <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
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
              {productIndustries.map((ind: any) => (
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
            <p className={`text-sm text-muted-foreground sm:text-base ${descExpanded ? "" : "line-clamp-3"}`}>
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
            {hasCollections ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Choose how to buy
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {collectionTiers.map((t: any, i: number) => {
                    const key = t.id ?? `tier-${i}`;
                    const active = key === selectedTierId;
                    const cPrice = Number(t.collectionPrice ?? Number(t.pricePerUnit) * Number(t.quantity)) || 0;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectTier(key)}
                        className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors ${
                          active
                            ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                            : "border-border bg-card hover:border-foreground/40"
                        }`}
                      >
                        <span className="font-display text-base text-foreground">{t.collectionName}</span>
                        <span className="mt-0.5 text-xs text-muted-foreground">
                          {Number(t.quantity).toLocaleString()} units
                        </span>
                        <span className="mt-2 text-sm font-semibold text-foreground">
                          KES {cPrice.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          KES {Number(t.pricePerUnit).toLocaleString()}/unit
                        </span>
                      </button>
                    );
                  })}
                  {individualEnabled && (
                    <button
                      type="button"
                      onClick={() => handleSelectTier(null)}
                      className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors ${
                        selectedTierId === null
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                          : "border-border bg-card hover:border-foreground/40"
                      }`}
                    >
                      <span className="font-display text-base text-foreground">Individual units</span>
                      <span className="mt-0.5 text-xs text-muted-foreground">Buy any quantity</span>
                      <span className="mt-2 text-sm font-semibold text-foreground">
                        KES {(product.basePrice ?? 0).toLocaleString()}/unit
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : tiers.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-2 bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  <span>Quantity</span>
                  <span className="text-right">Price per unit</span>
                </div>
                {(tiers as any[]).map((t) => {
                  const isActive = t === legacyTier;
                  return (
                    <div
                      key={`${t.minQty}-${t.maxQty ?? "max"}`}
                      className={`grid grid-cols-2 px-4 py-2 text-sm ${
                        isActive ? "bg-cream font-semibold text-foreground" : "text-foreground/80"
                      }`}
                    >
                      <span>
                        {Number(t.minQty).toLocaleString()}
                        {t.maxQty ? `–${Number(t.maxQty).toLocaleString()}` : "+"}
                      </span>
                      <span className="text-right">KES {Number(t.pricePerUnit).toLocaleString()}</span>
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
            {/* Stock badge */}
            <StockBadge state={stock.state} label={stock.label} />

            {variants.length > 0 && (
              <ConfigField label="Variant" note="(price & stock per variant)">
                <div className="flex flex-wrap gap-2">
                  {variants.map((v: any) => {
                    const key = v.id ?? v.label;
                    const active = key === variantId;
                    const vStock = getStockInfo(product, v, 0);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setVariantId(key)}
                        className={`flex flex-col items-start rounded-xl border px-3.5 py-2 text-left transition-colors ${
                          active
                            ? "border-primary bg-primary/5"
                            : "border-foreground/20 bg-cream hover:border-foreground/40"
                        }`}
                      >
                        <span className="text-xs font-semibold text-foreground">{v.label}</span>
                        <span className="mt-0.5 text-[11px] text-muted-foreground">
                          {v.price ? `KES ${v.price.toLocaleString()}` : "—"}
                          {" · "}
                          <span
                            className={
                              vStock.state === "out_of_stock"
                                ? "text-destructive"
                                : vStock.state === "low_stock"
                                  ? "text-accent"
                                  : "text-foreground/70"
                            }
                          >
                            {vStock.state === "out_of_stock"
                              ? "Backorder"
                              : vStock.state === "low_stock"
                                ? `${vStock.available} left`
                                : "In stock"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ConfigField>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <ConfigField label="Size">
                <PillGroup options={product.sizes} value={size} onChange={setSize} />
              </ConfigField>
            )}
            {(product.materials?.length ?? 0) > 0 && (
              <ConfigField label="Material">
                <PillGroup options={product.materials!} value={material} onChange={setMaterial} />
              </ConfigField>
            )}
            {finish && (
              <ConfigField label="Finish">
                <PillGroup options={[finish]} value={finish} onChange={setFinish} />
              </ConfigField>
            )}

            <ConfigField
              label={selectedTier ? `Number of ${selectedTier.collectionName}s` : "Quantity"}
              note={selectedTier ? `(${collectionQty} units each)` : `(Min. ${product.moq.toLocaleString()} units)`}
            >
              <input
                type="number"
                min={minQty}
                step={1}
                value={qty}
                onChange={(e) => handleQty(e.target.value)}
                onBlur={() => {
                  if (qty < minQty) setQty(minQty);
                  setQtyError(null);
                }}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {qtyError && <p className="mt-1.5 text-xs text-accent">{qtyError}</p>}
            </ConfigField>

            <div className="rounded-xl bg-primary px-5 py-4 text-primary-foreground">
              {selectedTier ? (
                <p className="text-sm">
                  {qty.toLocaleString()} × {selectedTier.collectionName} ({collectionQty} units) ={" "}
                  <span className="font-display text-lg font-semibold">KES {lineTotal.toLocaleString()}</span>
                  <span className="ml-2 text-xs opacity-80">
                    · {(qty * collectionQty).toLocaleString()} total units
                  </span>
                </p>
              ) : unitPrice > 0 ? (
                <p className="text-sm">
                  {qty.toLocaleString()} × KES {unitPrice.toLocaleString()} ={" "}
                  <span className="font-display text-lg font-semibold">KES {lineTotal.toLocaleString()}</span>
                </p>
              ) : (
                <p className="text-sm">Price calculated on order — our team will confirm.</p>
              )}
            </div>

            <span className="inline-flex items-center rounded-full bg-cream px-3 py-1 text-xs text-foreground">
              Production: 7–14 business days
            </span>

            {stock.isBackorder && !enterprise && (
              <div className="flex items-start gap-2 rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-xs text-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                <p>
                  <strong>Backorder:</strong> requested quantity exceeds current stock. We'll produce on demand —
                  extended lead time of approx. <strong>21 business days</strong>.
                </p>
              </div>
            )}

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
                {stock.isBackorder ? "Add to cart (backorder)" : "Add to cart"}
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
            <li className="rounded-full border border-border bg-cream px-3 py-1">✓ Secure M-Pesa checkout</li>
            <li className="rounded-full border border-border bg-cream px-3 py-1">✓ 7–14 day production</li>
            <li className="rounded-full border border-border bg-cream px-3 py-1">✓ Custom branding included</li>
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
              {product.material && <DetailRow label="Material" value={product.material} />}
              {product.finish && <DetailRow label="Finish" value={product.finish} />}
              {product.tags && product.tags.length > 0 && <DetailRow label="Tags" value={product.tags.join(", ")} />}
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
                {product.sizes.map((s: string) => (
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
            <ProductReviews productId={product.id} productSlug={product.slug} productName={product.name} />
          </TabsContent>
        </Tabs>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:pb-24 lg:px-8">
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">You might also like</h2>
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

function ConfigField({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {note && <span className="ml-1 font-normal normal-case tracking-normal text-foreground/60">{note}</span>}
      </p>
      {children}
    </div>
  );
}

function PillGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
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
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function StockBadge({ state, label }: { state: string; label: string }) {
  const styles =
    state === "out_of_stock"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : state === "low_stock"
        ? "bg-accent/10 text-accent border-accent/30"
        : "bg-primary/10 text-primary border-primary/30";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {label}
    </span>
  );
}
