import { useState, type CSSProperties, type ChangeEvent, type FormEvent } from "react";
import type { Product, ProductTag } from "@/data/products";
import { categories, industries } from "@/data/products";

// ---------------------------------------------------------------------------
// Admin product editor — mirrors the Product entity 1:1 so the form can be
// pointed at POST/PUT /api/admin/products without changing field names.
// Image upload accepts either a file (read as DataURL — temporary) or a URL
// paste, identical to the BlogEditor pattern. Cloudinary will replace this.
// ---------------------------------------------------------------------------

const TAGS: ProductTag[] = ["Trending", "New", "Discounted", "Featured"];

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
  };
}

// ---------------------------------------------------------------------------
// Styles — match AdminLayout's dark surface (same tokens as BlogEditor)
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: { maxWidth: 920, display: "flex", flexDirection: "column", gap: 18 },
  row: { display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" },
  rowThree: { display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr 1fr" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#8896A8",
  },
  helper: { fontSize: 11, color: "#4A5568" },
  input: {
    background: "#0F1117",
    border: "1px solid #1E2535",
    borderRadius: 8,
    padding: "9px 12px",
    color: "#E2E8F0",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
  },
  textarea: {
    background: "#0F1117",
    border: "1px solid #1E2535",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#E2E8F0",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    minHeight: 90,
  },
  select: {
    background: "#0F1117",
    border: "1px solid #1E2535",
    borderRadius: 8,
    padding: "9px 12px",
    color: "#E2E8F0",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
  },
  card: {
    background: "#161B27",
    border: "1px solid #1E2535",
    borderRadius: 10,
    padding: 16,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#E2E8F0" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  imagePreview: {
    width: "100%",
    maxWidth: 280,
    aspectRatio: "4 / 3",
    background: "#0F1117",
    border: "1px solid #1E2535",
    borderRadius: 10,
    objectFit: "cover" as const,
  },
  imagePlaceholder: {
    width: "100%",
    maxWidth: 280,
    aspectRatio: "4 / 3",
    background: "#0F1117",
    border: "1px dashed #1E2535",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4A5568",
    fontSize: 12,
  },
  fileBtn: {
    background: "#1E2535",
    border: "1px solid #2A3448",
    color: "#CBD5E0",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid #1E2535",
    color: "#8896A8",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  primaryBtn: {
    background: "#2D5A3D",
    color: "#9AE6B4",
    border: "none",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 12.5,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  dangerBtn: {
    background: "#3A1A1A",
    color: "#FC8181",
    border: "1px solid #5A2A2A",
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
    background: "#1E2535",
    border: "1px solid #2A3448",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 11,
    color: "#CBD5E0",
  },
  removeX: {
    background: "transparent",
    border: "none",
    color: "#FC8181",
    cursor: "pointer",
    fontSize: 12,
    padding: 0,
    lineHeight: 1,
  },
  inlineRow: { display: "flex", gap: 8, alignItems: "center" },
  errorText: { fontSize: 12, color: "#FC8181" },
  switchRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: "#0F1117",
    border: "1px solid #1E2535",
    borderRadius: 8,
  },
  switchLabel: { fontSize: 12.5, color: "#CBD5E0", flex: 1 },
};

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

    if (!values.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!values.image) {
      setError("Please add a product image.");
      return;
    }
    if (!values.category) {
      setError("Please pick a category.");
      return;
    }
    if (values.moq < 1) {
      setError("MOQ must be at least 1.");
      return;
    }
    if (values.isDiscount && (!values.discountPercent || values.discountPercent <= 0)) {
      setError("Set a discount percentage when 'Discounted' is on.");
      return;
    }

    setBusy(true);
    try {
      // Mirror the main image into images[] if not already there.
      const images = values.images.length ? values.images : [values.image];
      await onSubmit({ ...values, images });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form style={styles.wrap} onSubmit={handleSubmit}>
      {/* Core */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Core details</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={styles.row}>
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
                value={values.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="auto-generated from name"
              />
              <span style={styles.helper}>Leave blank to auto-generate from the name.</span>
            </div>
          </div>

          <div style={styles.row}>
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
              placeholder='e.g. Small (200×100×250mm), 8oz, A5…'
            />
          </div>
          <div style={styles.row}>
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
          <span style={styles.helper}>Pick all that apply — drives industry filters & search.</span>
        </div>
        <div style={styles.chipRow}>
          {industries.map((ind) => {
            const active = values.industryIds.includes(ind.id);
            return (
              <button
                key={ind.id}
                type="button"
                style={styles.chip(active)}
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
                  style={styles.chip(values.tags.includes(t))}
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

          <div style={styles.rowThree}>
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

      {error && <div style={styles.errorText}>{error}</div>}

      <div style={styles.actionsBar}>
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
          <button type="button" style={styles.ghostBtn} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="submit" style={styles.primaryBtn} disabled={busy}>
            {busy ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

export default ProductEditor;
