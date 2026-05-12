import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { Product, ProductTag } from "@/data/products";
import { categories, industries } from "@/data/products";

// ---------------------------------------------------------------------------
// Admin product editor — mirrors the Product entity 1:1 so the form can be
// pointed at POST/PUT /api/admin/products without changing field names.
// Image upload accepts either a file (read as DataURL — temporary) or a URL
// paste, identical to the BlogEditor pattern. Cloudinary will replace this.
// ---------------------------------------------------------------------------

const TAGS: ProductTag[] = ["Trending", "New", "Discounted", "Featured"];

export interface ProductVariant {
  id?: string;
  label: string;       // e.g. "Small / Kraft"
  sku?: string;
  price?: number;      // unit price KES
  stock?: number;
}

export interface PricingTierRow {
  id?: string;
  collectionName: string;
  quantity: number;
  pricePerUnit: number;
  sortOrder?: number;
}

export interface ProductFormValues {
  name: string;
  slug: string;
  category: string;
  description: string;
  moq: number;
  sizes: string[];
  tags: ProductTag[];
  image: string;
  images: string[];
  isDiscount: boolean;
  discountPercent?: number;
  isNewArrival: boolean;
  isFastMoving: boolean;
  industryIds: string[];
  totalClicks: number;
  monthlyClicks: number;
  totalEnquiries: number;
  monthlyEnquiries: number;
  material?: string;
  finish?: string;
  keywords?: string[];
  // Inventory (Phase 2)
  sku?: string;
  basePrice?: number;        // KES
  compareAtPrice?: number;   // KES — strike-through reference
  stock?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  variants?: ProductVariant[];
  individualSalesEnabled?: boolean;
  pricingTiers?: PricingTierRow[];
}

export function emptyProductValues(): ProductFormValues {
  return {
    name: "",
    slug: "",
    category: categories[0]?.slug ?? "bags",
    description: "",
    moq: 100,
    sizes: [],
    tags: [],
    image: "",
    images: [],
    isDiscount: false,
    discountPercent: undefined,
    isNewArrival: false,
    isFastMoving: false,
    industryIds: [],
    totalClicks: 0,
    monthlyClicks: 0,
    totalEnquiries: 0,
    monthlyEnquiries: 0,
    material: "",
    finish: "",
    keywords: [],
    sku: "",
    basePrice: undefined,
    compareAtPrice: undefined,
    stock: 0,
    lowStockThreshold: 10,
    trackInventory: true,
    variants: [],
    individualSalesEnabled: true,
    pricingTiers: [],
  };
}

export function productToFormValues(p: Product): ProductFormValues {
  return {
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.description,
    moq: p.moq,
    sizes: [...p.sizes],
    tags: [...p.tags],
    image: p.image,
    images: [...p.images],
    isDiscount: p.isDiscount,
    discountPercent: p.discountPercent,
    isNewArrival: p.isNewArrival,
    isFastMoving: p.isFastMoving,
    industryIds: [...p.industryIds],
    totalClicks: p.totalClicks,
    monthlyClicks: p.monthlyClicks,
    totalEnquiries: p.totalEnquiries,
    monthlyEnquiries: p.monthlyEnquiries,
    material: p.material ?? "",
    finish: p.finish ?? "",
    keywords: p.keywords ? [...p.keywords] : [],
    sku: (p as Product & { sku?: string }).sku ?? "",
    basePrice: p.basePrice,
    compareAtPrice: (p as Product & { compareAtPrice?: number }).compareAtPrice,
    stock: (p as Product & { stock?: number }).stock ?? 0,
    lowStockThreshold: (p as Product & { lowStockThreshold?: number }).lowStockThreshold ?? 10,
    trackInventory: (p as Product & { trackInventory?: boolean }).trackInventory ?? true,
    variants: (p as Product & { variants?: ProductVariant[] }).variants
      ? [...((p as Product & { variants?: ProductVariant[] }).variants ?? [])]
      : [],
    individualSalesEnabled: (p as any).individualSalesEnabled ?? true,
    pricingTiers: ((p as any).pricingTiers ?? [])
      .filter((t: any) => t && t.collectionName)
      .map((t: any, i: number) => ({
        id: t.id,
        collectionName: String(t.collectionName ?? ""),
        quantity: Number(t.quantity ?? 0),
        pricePerUnit: Number(t.pricePerUnit ?? 0),
        sortOrder: t.sortOrder ?? i,
      })),
  };
}

// ---------------------------------------------------------------------------
// Styles — match AdminLayout's dark surface (same tokens as BlogEditor)
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {
    maxWidth: 1240,
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 520px), 1fr))",
    gap: 20,
    alignItems: "start",
  },
  row: { display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))" },
  rowThree: { display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))" },
  field: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "var(--admin-muted)",
  },
  helper: { fontSize: 11, color: "var(--admin-muted)" },
  input: {
    background: "color-mix(in oklab, var(--admin-bg) 82%, var(--admin-surface) 18%)",
    border: "1px solid var(--admin-border)",
    borderRadius: 8,
    padding: "9px 12px",
    color: "var(--admin-text)",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  textarea: {
    background: "color-mix(in oklab, var(--admin-bg) 82%, var(--admin-surface) 18%)",
    border: "1px solid var(--admin-border)",
    borderRadius: 8,
    padding: "10px 12px",
    color: "var(--admin-text)",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    minHeight: 90,
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  select: {
    background: "var(--admin-bg)",
    border: "1px solid var(--admin-border)",
    borderRadius: 8,
    padding: "9px 12px",
    color: "var(--admin-text)",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  card: {
    background:
      "linear-gradient(180deg, color-mix(in oklab, var(--admin-surface) 92%, var(--cream) 8%), var(--admin-surface))",
    border: "1px solid var(--admin-border)",
    borderRadius: 14,
    padding: 18,
    boxShadow: "var(--admin-shadow)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 650,
    color: "var(--admin-text)",
    fontFamily: "var(--font-display)",
    letterSpacing: 0,
  },
  mainColumn: { display: "flex", flexDirection: "column", gap: 18, minWidth: 0 },
  sideColumn: { display: "flex", flexDirection: "column", gap: 18, minWidth: 0 },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  imagePreview: {
    width: "100%",
    maxWidth: 280,
    aspectRatio: "4 / 3",
    background: "var(--admin-bg)",
    border: "1px solid var(--admin-border)",
    borderRadius: 10,
    objectFit: "cover" as const,
  },
  imagePlaceholder: {
    width: "100%",
    maxWidth: 280,
    aspectRatio: "4 / 3",
    background: "var(--admin-bg)",
    border: "1px dashed var(--admin-border)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--admin-muted)",
    fontSize: 12,
  },
  previewCard: {
    background: "var(--admin-surface)",
    border: "1px solid var(--admin-border)",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "var(--admin-shadow)",
  },
  previewImage: {
    width: "100%",
    aspectRatio: "4 / 3",
    objectFit: "cover" as const,
    background: "var(--admin-bg)",
  },
  previewBody: { padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  previewTitle: {
    color: "var(--admin-text)",
    fontFamily: "var(--font-display)",
    fontSize: 22,
    fontWeight: 650,
    lineHeight: 1.1,
    margin: 0,
  },
  previewMeta: {
    color: "var(--admin-muted)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  previewDescription: { color: "var(--admin-muted)", fontSize: 12.5, lineHeight: 1.55, margin: 0 },
  fileBtn: {
    background: "var(--admin-border)",
    border: "1px solid var(--admin-border)",
    color: "var(--admin-text)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid var(--admin-border)",
    color: "var(--admin-muted)",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  primaryBtn: {
    background: "var(--admin-accent)",
    color: "var(--cream)",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 12.5,
    fontWeight: 650,
    cursor: "pointer",
    fontFamily: "var(--font-display)",
  },
  dangerBtn: {
    background: "color-mix(in oklab, var(--admin-clay) 22%, var(--admin-bg))",
    color: "var(--admin-clay)",
    border: "1px solid var(--admin-clay)",
    borderRadius: 8,
    padding: "9px 14px",
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  actionsBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 6,
  },
  actionsRight: { display: "flex", gap: 10, marginLeft: "auto" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "var(--admin-border)",
    border: "1px solid var(--admin-border)",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 11,
    color: "var(--admin-text)",
  },
  removeX: {
    background: "transparent",
    border: "none",
    color: "var(--admin-clay)",
    cursor: "pointer",
    fontSize: 12,
    padding: 0,
    lineHeight: 1,
  },
  inlineRow: { display: "flex", gap: 8, alignItems: "center" },
  errorText: { fontSize: 12, color: "var(--admin-clay)" },
  validationList: {
    margin: 0,
    paddingLeft: 18,
    color: "var(--admin-clay)",
    fontSize: 12,
    lineHeight: 1.7,
  },
  switchRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: "color-mix(in oklab, var(--admin-bg) 74%, var(--admin-surface) 26%)",
    border: "1px solid var(--admin-border)",
    borderRadius: 10,
  },
  switchLabel: { fontSize: 12.5, color: "var(--admin-text)", flex: 1 },
};

function chipStyle(active: boolean): CSSProperties {
  return {
    border: `1px solid ${active ? "var(--admin-accent-hover)" : "var(--admin-border)"}`,
    background: active
      ? "color-mix(in oklab, var(--admin-accent) 34%, var(--admin-surface))"
      : "var(--admin-bg)",
    color: active ? "var(--cream)" : "var(--admin-muted)",
    borderRadius: 999,
    padding: "5px 12px",
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

function slugifyDraft(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

function validateProduct(values: ProductFormValues): string[] {
  const issues: string[] = [];
  if (!values.name.trim()) issues.push("Product name is required.");
  if (!values.slug.trim() && !values.name.trim())
    issues.push("Add a name so the URL slug can be generated.");
  if (!values.image) issues.push("Add a product image.");
  if (!values.category) issues.push("Pick a product category.");
  if (!values.description.trim()) issues.push("Add a short catalogue description.");
  if (values.moq < 1) issues.push("MOQ must be at least 1.");
  if (values.isDiscount && (!values.discountPercent || values.discountPercent <= 0)) {
    issues.push("Set a discount percentage when Discounted is on.");
  }
  if (values.isDiscount && values.discountPercent && values.discountPercent > 90) {
    issues.push("Discount percentage must be 90% or lower.");
  }
  return issues;
}

// ---------------------------------------------------------------------------
// Image picker — mirrors BlogEditor (file -> DataURL, or URL paste)
// ---------------------------------------------------------------------------

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [urlDraft, setUrlDraft] = useState("");

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
    // reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {value ? (
        <img src={value} alt="Product preview" style={styles.imagePreview} />
      ) : (
        <div style={styles.imagePlaceholder}>No image yet</div>
      )}

      <div style={styles.inlineRow}>
        <label style={styles.fileBtn}>
          Upload file
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        </label>
        {value && (
          <button type="button" style={styles.ghostBtn} onClick={() => onChange("")}>
            Remove
          </button>
        )}
      </div>

      <div style={styles.inlineRow}>
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="…or paste an image URL"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
        />
        <button
          type="button"
          style={styles.ghostBtn}
          onClick={() => {
            if (urlDraft.trim()) {
              onChange(urlDraft.trim());
              setUrlDraft("");
            }
          }}
        >
          Use URL
        </button>
      </div>
      <div style={styles.helper}>
        File uploads are stored as data URLs in this preview. Cloudinary will replace this once the
        backend is live.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tokenized list input — used for sizes & keywords
// ---------------------------------------------------------------------------

interface TokenInputProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

function TokenInput({ values, onChange, placeholder }: TokenInputProps) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim();
    if (!v) return;
    if (values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={styles.inlineRow}>
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
        />
        <button type="button" style={styles.ghostBtn} onClick={commit}>
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div style={styles.chipRow}>
          {values.map((v) => (
            <span key={v} style={styles.badge}>
              {v}
              <button
                type="button"
                style={styles.removeX}
                onClick={() => onChange(values.filter((x) => x !== v))}
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main editor
// ---------------------------------------------------------------------------

export interface ProductEditorProps {
  initial: ProductFormValues;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onCancel: () => void;
}

export function ProductEditor({
  initial,
  submitLabel,
  onSubmit,
  onDelete,
  onCancel,
}: ProductEditorProps) {
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initial),
    [initial, values],
  );
  const validationIssues = useMemo(() => validateProduct(values), [values]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const toggleIndustry = (id: string) => {
    setValues((v) => ({
      ...v,
      industryIds: v.industryIds.includes(id)
        ? v.industryIds.filter((x) => x !== id)
        : [...v.industryIds, id],
    }));
  };

  const toggleTag = (tag: ProductTag) => {
    setValues((v) => ({
      ...v,
      tags: v.tags.includes(tag) ? v.tags.filter((x) => x !== tag) : [...v.tags, tag],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    setSubmitted(true);
    if (validationIssues.length) {
      setError("Please resolve the highlighted fields before saving.");
      return;
    }

    setBusy(true);
    try {
      // Mirror the main image into images[] if not already there.
      const images = values.images.length ? values.images : [values.image];
      await onSubmit({ ...values, slug: values.slug || slugifyDraft(values.name), images });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form style={styles.wrap} onSubmit={handleSubmit} data-admin-editor-grid>
      <div style={styles.mainColumn}>
        {/* Core */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Core details</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={styles.row} data-admin-row>
              <div style={styles.field}>
                <label style={styles.label}>Name</label>
                <input
                  style={styles.input}
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Kraft Twisted-Handle Bag"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>URL slug</label>
                <input
                  style={styles.input}
                  value={values.slug || slugifyDraft(values.name)}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="auto-generated from name"
                />
                <span style={styles.helper}>Leave blank to auto-generate from the name.</span>
              </div>
            </div>

            <div style={styles.row} data-admin-row>
              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.select}
                  value={values.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>MOQ (minimum order quantity)</label>
                <input
                  type="number"
                  min={1}
                  style={styles.input}
                  value={values.moq}
                  onChange={(e) => set("moq", Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Short product summary shown on the catalogue + detail page."
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Product image</div>
          </div>
          <ImagePicker value={values.image} onChange={(url) => set("image", url)} />
        </div>

        {/* Pricing & Inventory */}
        {/* Pricing & Inventory */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Pricing & inventory</div>
            <span style={styles.helper}>All prices in KES. Stock drives low-stock alerts.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={styles.rowThree} data-admin-row>
              <div style={styles.field}>
                <label style={styles.label}>SKU</label>
                <input
                  style={styles.input}
                  value={values.sku ?? ""}
                  onChange={(e) => set("sku", e.target.value)}
                  placeholder="e.g. KRB-MD-001"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Base price (KES)</label>
                <input
                  type="number"
                  min={0}
                  style={styles.input}
                  value={values.basePrice ?? ""}
                  onChange={(e) => set("basePrice", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                />
                <span style={styles.helper}>Internal reference price per unit. Shown to buyers only when individual sales are enabled below.</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Compare-at price</label>
                <input
                  type="number"
                  min={0}
                  style={styles.input}
                  value={values.compareAtPrice ?? ""}
                  onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="optional strike-through"
                />
              </div>
            </div>

            <label style={styles.switchRow}>
              <input
                type="checkbox"
                checked={values.trackInventory ?? true}
                onChange={(e) => set("trackInventory", e.target.checked)}
              />
              <span style={styles.switchLabel}>Track inventory levels for this product</span>
            </label>

            {(values.trackInventory ?? true) && (
              <div style={styles.row} data-admin-row>
                <div style={styles.field}>
                  <label style={styles.label}>Stock on hand (units)</label>
                  <input
                    type="number"
                    min={0}
                    style={styles.input}
                    value={values.stock ?? 0}
                    onChange={(e) => set("stock", Number(e.target.value) || 0)}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Low-stock threshold</label>
                  <input
                    type="number"
                    min={0}
                    style={styles.input}
                    value={values.lowStockThreshold ?? 10}
                    onChange={(e) => set("lowStockThreshold", Number(e.target.value) || 0)}
                  />
                  <span style={styles.helper}>Alert when stock drops below this number.</span>
                </div>
              </div>
            )}

            {/* Individual sales toggle */}
            <label style={styles.switchRow}>
              <input
                type="checkbox"
                checked={values.individualSalesEnabled ?? true}
                onChange={(e) => set("individualSalesEnabled", e.target.checked)}
              />
              <span style={styles.switchLabel}>
                Allow individual unit purchases
                <span style={{ ...styles.helper, display: "block", marginTop: 2 }}>
                  Disable for collections-only products (e.g. carrier bags sold only in packs). Base price will be hidden from buyers.
                </span>
              </span>
            </label>

            {/* Pricing tiers (collections) */}
            <div style={styles.field}>
              <label style={styles.label}>Pricing collections</label>
              <span style={styles.helper}>
                Define named bundles like "Half Dozen = 6 units @ KES 9/unit". Customers pick a collection. sortOrder is set automatically by row position.
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 0.7fr 0.8fr 0.9fr auto",
                    gap: 6,
                    fontSize: 10,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.1em",
                    color: "var(--admin-muted)",
                    paddingInline: 4,
                  }}
                >
                  <span>Collection name</span>
                  <span>Qty (units)</span>
                  <span>KES / unit</span>
                  <span>Total (auto)</span>
                  <span />
                </div>
                {(values.pricingTiers ?? []).map((row, idx) => {
                  const total = (Number(row.quantity) || 0) * (Number(row.pricePerUnit) || 0);
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 0.7fr 0.8fr 0.9fr auto",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      <input
                        style={styles.input}
                        placeholder="e.g. Half Dozen"
                        value={row.collectionName}
                        onChange={(e) => {
                          const next = [...(values.pricingTiers ?? [])];
                          next[idx] = { ...row, collectionName: e.target.value };
                          set("pricingTiers", next);
                        }}
                      />
                      <input
                        type="number"
                        min={1}
                        style={styles.input}
                        placeholder="6"
                        value={row.quantity || ""}
                        onChange={(e) => {
                          const next = [...(values.pricingTiers ?? [])];
                          next[idx] = { ...row, quantity: Number(e.target.value) || 0 };
                          set("pricingTiers", next);
                        }}
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        style={styles.input}
                        placeholder="9.00"
                        value={row.pricePerUnit || ""}
                        onChange={(e) => {
                          const next = [...(values.pricingTiers ?? [])];
                          next[idx] = { ...row, pricePerUnit: Number(e.target.value) || 0 };
                          set("pricingTiers", next);
                        }}
                      />
                      <div
                        style={{
                          ...styles.input,
                          background: "transparent",
                          color: total > 0 ? "var(--admin-text)" : "var(--admin-muted)",
                          display: "flex",
                          alignItems: "center",
                          fontWeight: total > 0 ? 600 : 400,
                        }}
                      >
                        KES {total > 0 ? total.toLocaleString() : "—"}
                      </div>
                      <button
                        type="button"
                        style={styles.removeX}
                        onClick={() =>
                          set(
                            "pricingTiers",
                            (values.pricingTiers ?? []).filter((_, i) => i !== idx),
                          )
                        }
                        aria-label="Remove tier"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  style={styles.ghostBtn}
                  onClick={() =>
                    set("pricingTiers", [
                      ...(values.pricingTiers ?? []),
                      {
                        collectionName: "",
                        quantity: 0,
                        pricePerUnit: 0,
                        sortOrder: (values.pricingTiers ?? []).length,
                      },
                    ])
                  }
                >
                  + Add collection
                </button>
              </div>
            </div>

            {/* Variants */}
            <div style={styles.field}>
              <label style={styles.label}>Variants (size / material combinations)</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(values.variants ?? []).map((variant, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 0.9fr 0.7fr 0.7fr auto",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    <input
                      style={styles.input}
                      placeholder="Label (e.g. Small / Kraft)"
                      value={variant.label}
                      onChange={(e) => {
                        const next = [...(values.variants ?? [])];
                        next[idx] = { ...variant, label: e.target.value };
                        set("variants", next);
                      }}
                    />
                    <input
                      style={styles.input}
                      placeholder="SKU"
                      value={variant.sku ?? ""}
                      onChange={(e) => {
                        const next = [...(values.variants ?? [])];
                        next[idx] = { ...variant, sku: e.target.value };
                        set("variants", next);
                      }}
                    />
                    <input
                      type="number"
                      min={0}
                      style={styles.input}
                      placeholder="Price"
                      value={variant.price ?? ""}
                      onChange={(e) => {
                        const next = [...(values.variants ?? [])];
                        next[idx] = { ...variant, price: e.target.value ? Number(e.target.value) : undefined };
                        set("variants", next);
                      }}
                    />
                    <input
                      type="number"
                      min={0}
                      style={styles.input}
                      placeholder="Stock"
                      value={variant.stock ?? ""}
                      onChange={(e) => {
                        const next = [...(values.variants ?? [])];
                        next[idx] = { ...variant, stock: e.target.value ? Number(e.target.value) : undefined };
                        set("variants", next);
                      }}
                    />
                    <button
                      type="button"
                      style={styles.removeX}
                      onClick={() => set("variants", (values.variants ?? []).filter((_, i) => i !== idx))}
                      aria-label="Remove variant"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  style={styles.ghostBtn}
                  onClick={() =>
                    set("variants", [...(values.variants ?? []), { label: "", sku: "", price: undefined, stock: undefined }])
                  }
                >
                  + Add variant
                </button>
              </div>
              <span style={styles.helper}>
                Leave empty for a single-SKU product — base price + stock above will be used.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.sideColumn}>
        {/* Sizes & material */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Variants & spec</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={styles.field}>
              <label style={styles.label}>Available sizes</label>
              <TokenInput
                values={values.sizes}
                onChange={(next) => set("sizes", next)}
                placeholder="e.g. Small (200×100×250mm), 8oz, A5…"
              />
            </div>
            <div style={styles.row} data-admin-row>
              <div style={styles.field}>
                <label style={styles.label}>Material</label>
                <input
                  style={styles.input}
                  value={values.material ?? ""}
                  onChange={(e) => set("material", e.target.value)}
                  placeholder="e.g. Kraft 120gsm"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Finish</label>
                <input
                  style={styles.input}
                  value={values.finish ?? ""}
                  onChange={(e) => set("finish", e.target.value)}
                  placeholder="e.g. Matte, Gloss, Soft-touch"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Industries */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Industries served</div>
            <span style={styles.helper}>
              Pick all that apply — drives industry filters & search.
            </span>
          </div>
          <div style={styles.chipRow}>
            {industries.map((ind) => {
              const active = values.industryIds.includes(ind.id);
              return (
                <button
                  key={ind.id}
                  type="button"
                  style={chipStyle(active)}
                  onClick={() => toggleIndustry(ind.id)}
                >
                  {ind.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags & keywords */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Tags & search keywords</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={styles.field}>
              <label style={styles.label}>Display tags</label>
              <div style={styles.chipRow}>
                {TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    style={chipStyle(values.tags.includes(t))}
                    onClick={() => toggleTag(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Search keywords</label>
              <TokenInput
                values={values.keywords ?? []}
                onChange={(next) => set("keywords", next)}
                placeholder="e.g. coffee, takeaway cup, kikombe"
              />
              <span style={styles.helper}>
                Synonyms, sheng, common misspellings — all boost search recall.
              </span>
            </div>
          </div>
        </div>

        {/* Carousel flags */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Homepage carousel & popularity</div>
            <span style={styles.helper}>Drives the "Picks of the moment" section.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={styles.switchRow}>
              <input
                type="checkbox"
                checked={values.isDiscount}
                onChange={(e) => set("isDiscount", e.target.checked)}
              />
              <span style={styles.switchLabel}>Discounted (appears in "Deals")</span>
              {values.isDiscount && (
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={values.discountPercent ?? ""}
                  placeholder="%"
                  onChange={(e) =>
                    set("discountPercent", e.target.value ? Number(e.target.value) : undefined)
                  }
                  style={{ ...styles.input, width: 70 }}
                />
              )}
            </label>
            <label style={styles.switchRow}>
              <input
                type="checkbox"
                checked={values.isNewArrival}
                onChange={(e) => set("isNewArrival", e.target.checked)}
              />
              <span style={styles.switchLabel}>New arrival (appears in "Just landed")</span>
            </label>
            <label style={styles.switchRow}>
              <input
                type="checkbox"
                checked={values.isFastMoving}
                onChange={(e) => set("isFastMoving", e.target.checked)}
              />
              <span style={styles.switchLabel}>Fast-moving (appears in "Trending")</span>
            </label>

            <div style={styles.rowThree} data-admin-row>
              <div style={styles.field}>
                <label style={styles.label}>Monthly clicks</label>
                <input
                  type="number"
                  min={0}
                  style={styles.input}
                  value={values.monthlyClicks}
                  onChange={(e) => set("monthlyClicks", Number(e.target.value) || 0)}
                />
                <span style={styles.helper}>Used as the popularity tie-breaker in search.</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Total clicks</label>
                <input
                  type="number"
                  min={0}
                  style={styles.input}
                  value={values.totalClicks}
                  onChange={(e) => set("totalClicks", Number(e.target.value) || 0)}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Monthly enquiries</label>
                <input
                  type="number"
                  min={0}
                  style={styles.input}
                  value={values.monthlyEnquiries}
                  onChange={(e) => set("monthlyEnquiries", Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={styles.previewCard}>
          {values.image ? (
            <img src={values.image} alt="" style={styles.previewImage} />
          ) : (
            <div style={{ ...styles.imagePlaceholder, maxWidth: "none", borderRadius: 0 }}>
              Preview image
            </div>
          )}
          <div style={styles.previewBody}>
            <div style={styles.previewMeta}>
              {categoryName(values.category)} · MOQ {Math.max(values.moq, 0).toLocaleString()}
            </div>
            <h3 style={styles.previewTitle}>{values.name || "Product name"}</h3>
            <p style={styles.previewDescription}>
              {values.description ||
                "Product description preview appears here as the catalogue card will read."}
            </p>
            <div style={styles.chipRow}>
              {values.isNewArrival && <span style={styles.badge}>New arrival</span>}
              {values.isFastMoving && <span style={styles.badge}>Fast moving</span>}
              {values.isDiscount && (
                <span style={styles.badge}>-{values.discountPercent ?? 0}%</span>
              )}
            </div>
          </div>
        </div>

        {(error || (submitted && validationIssues.length > 0)) && (
          <div style={styles.errorText}>
            {error && <div>{error}</div>}
            {submitted && validationIssues.length > 0 && (
              <ul style={styles.validationList}>
                {validationIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div style={styles.actionsBar} data-admin-actions>
          {onDelete && (
            <button
              type="button"
              style={styles.dangerBtn}
              onClick={() => void onDelete()}
              disabled={busy}
            >
              Delete product
            </button>
          )}
          <div style={styles.actionsRight}>
            <button
              type="button"
              style={styles.ghostBtn}
              onClick={() => {
                if (isDirty && !confirm("Discard unsaved product changes?")) return;
                onCancel();
              }}
              disabled={busy}
            >
              Cancel
            </button>
            <button type="submit" style={styles.primaryBtn} disabled={busy}>
              {busy ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default ProductEditor;
