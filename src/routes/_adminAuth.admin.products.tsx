import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useAuth } from "@/contexts/AdminAuthContext";
import { adminResources, type IndustryDto, type ProductDto, type ProductRequest } from "@/services/adminResources";

export const Route = createFileRoute("/_adminAuth/admin/products")({ component: AdminProductsPage });

const emptyProduct: ProductRequest = { name: "", category: "", description: "", moq: 1, sizes: [], tags: [], keywords: [], primaryImageUrl: "", imageUrls: [], isDiscount: false, discountPercent: undefined, isNewArrival: false, isFastMoving: false, material: "", finish: "", industryIds: [] };
function csv(v?: string[]) { return (v ?? []).join(", "); }
function split(v: string) { return v.split(",").map((x) => x.trim()).filter(Boolean); }

function AdminProductsPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [industries, setIndustries] = useState<IndustryDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ industryId: "", category: "", isDiscount: "", isNewArrival: "", isFastMoving: "" });
  const [form, setForm] = useState<ProductRequest>(emptyProduct);
  const [sizesText, setSizesText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [keywordsText, setKeywordsText] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [productPage, industryRows] = await Promise.all([adminResources.products.list({ ...filters, page, size: 10, sort: "createdAt,desc" }), adminResources.industries.list()]);
      setProducts(productPage.rows); setTotalPages(productPage.totalPages); setIndustries(industryRows);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to load products"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [page, filters.industryId, filters.category, filters.isDiscount, filters.isNewArrival, filters.isFastMoving]);

  const beginCreate = () => { setEditing(null); setForm(emptyProduct); setSizesText(""); setTagsText(""); setKeywordsText(""); setOpen(true); };
  const beginEdit = (p: ProductDto) => { setEditing(p); setForm({ name: p.name, category: p.category ?? "", description: p.description ?? "", moq: p.moq ?? 1, sizes: p.sizes ?? [], tags: p.tags ?? [], keywords: p.keywords ?? [], primaryImageUrl: p.primaryImageUrl ?? p.imageUrls?.[0] ?? "", imageUrls: p.imageUrls ?? [], isDiscount: !!p.isDiscount, discountPercent: p.discountPercent ?? undefined, isNewArrival: !!p.isNewArrival, isFastMoving: !!p.isFastMoving, material: p.material ?? "", finish: p.finish ?? "", industryIds: p.industryIds ?? p.industries?.map((i) => String(i.id)) ?? [] }); setSizesText(csv(p.sizes)); setTagsText(csv(p.tags)); setKeywordsText(csv(p.keywords)); setOpen(true); };
  const payload = useMemo(() => ({ ...form, sizes: split(sizesText), tags: split(tagsText), keywords: split(keywordsText), moq: Number(form.moq) || 1, discountPercent: form.isDiscount ? Number(form.discountPercent) || 0 : undefined }), [form, sizesText, tagsText, keywordsText]);

  const save = async (e: FormEvent) => { e.preventDefault(); setSaving(true); try { editing ? await adminResources.products.update(editing.id, payload) : await adminResources.products.create(payload); toast.success(editing ? "Product updated" : "Product created"); setOpen(false); await load(); } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); } finally { setSaving(false); } };
  const remove = async (p: ProductDto) => { if (!isAdmin || !confirm(`Delete ${p.name}?`)) return; setSaving(true); try { await adminResources.products.remove(p.id); toast.success("Product deleted"); await load(); } catch (err) { toast.error(err instanceof Error ? err.message : "Delete failed"); } finally { setSaving(false); } };

  return <AdminLayout title="Products" actionLabel="New product" onAction={beginCreate}><div className="admin-page-stack">
    <div className="admin-panel admin-toolbar" data-admin-toolbar>
      <select className="admin-select" style={{ maxWidth: 220 }} value={filters.industryId} onChange={(e) => { setPage(0); setFilters({ ...filters, industryId: e.target.value }); }}><option value="">All industries</option>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
      <input className="admin-input" style={{ maxWidth: 220 }} placeholder="Category" value={filters.category} onChange={(e) => { setPage(0); setFilters({ ...filters, category: e.target.value }); }} />
      {(["isDiscount", "isNewArrival", "isFastMoving"] as const).map((key) => <button key={key} className={`admin-btn ${filters[key] ? "admin-btn-primary" : "admin-btn-ghost"}`} onClick={() => { setPage(0); setFilters({ ...filters, [key]: filters[key] ? "" : "true" }); }}>{key.replace("is", "")}</button>)}
    </div>
    <div className="admin-panel" data-admin-table-scroll><table className="admin-table"><thead><tr><th>Product</th><th>SKU</th><th>Price (KES)</th><th>Stock</th><th>Category</th><th>Flags</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan={7}>Loading products…</td></tr> : products.length === 0 ? <tr><td colSpan={7}><div className="admin-empty">No products found. <button className="admin-btn admin-btn-primary" onClick={beginCreate}>Create product</button></div></td></tr> : products.map((p) => { const stock = p.stock ?? 0; const threshold = p.lowStockThreshold ?? 50; const tracking = p.trackInventory ?? true; const stockTone = !tracking ? "var(--admin-muted)" : stock === 0 ? "#b91c1c" : stock < threshold ? "#a16207" : "#15803d"; return <tr key={p.id}><td><div style={{ display: "flex", gap: 10, alignItems: "center" }}>{(p.primaryImageUrl || p.imageUrls?.[0]) && <img src={p.primaryImageUrl || p.imageUrls?.[0]} alt="" style={{ width: 44, height: 38, objectFit: "cover", borderRadius: 6 }} />}<b>{p.name}</b></div></td><td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.sku || "—"}</td><td>{p.basePrice != null ? p.basePrice.toLocaleString() : "—"}</td><td style={{ color: stockTone, fontWeight: 600 }}>{tracking ? `${stock.toLocaleString()}${stock < threshold ? " ⚠" : ""}` : "Untracked"}</td><td>{p.category || "—"}</td><td>{[p.isDiscount && "Discount", p.isNewArrival && "New", p.isFastMoving && "Fast"].filter(Boolean).join(" · ") || "—"}</td><td><button className="admin-btn admin-btn-ghost" onClick={() => beginEdit(p)}><Pencil size={14} />Edit</button>{isAdmin && <button className="admin-btn admin-btn-danger" onClick={() => void remove(p)}><Trash2 size={14} />Delete</button>}</td></tr>; })}</tbody></table></div>
    <div className="admin-toolbar"><button className="admin-btn admin-btn-ghost" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</button><span className="admin-label">Page {page + 1} of {totalPages}</span><button className="admin-btn admin-btn-ghost" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button></div>
    {open && <div className="admin-modal-backdrop"><form className="admin-modal" onSubmit={save}><div className="admin-toolbar"><h2>{editing ? "Edit product" : "Create product"}</h2><button type="button" className="admin-btn admin-btn-ghost" onClick={() => setOpen(false)}>Close</button></div><div className="admin-form-grid" data-admin-editor-grid>
      <label><span className="admin-label">Name</span><input required className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label><span className="admin-label">Category</span><input className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
      <label><span className="admin-label">MOQ</span><input type="number" min={1} className="admin-input" value={form.moq} onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })} /></label>
      <label><span className="admin-label">Discount %</span><input type="number" className="admin-input" value={form.discountPercent ?? ""} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} /></label>
      <label><span className="admin-label">Material</span><input className="admin-input" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} /></label>
      <label><span className="admin-label">Finish</span><input className="admin-input" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} /></label>
      <label style={{ gridColumn: "1/-1" }}><span className="admin-label">Description</span><textarea className="admin-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label><span className="admin-label">Sizes</span><input className="admin-input" value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder="Small, Medium" /></label>
      <label><span className="admin-label">Tags</span><input className="admin-input" value={tagsText} onChange={(e) => setTagsText(e.target.value)} /></label>
      <label><span className="admin-label">Keywords</span><input className="admin-input" value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} /></label>
      <label><span className="admin-label">Industries</span><select multiple className="admin-select" value={form.industryIds ?? []} onChange={(e) => setForm({ ...form, industryIds: Array.from(e.target.selectedOptions).map((o) => o.value) })}>{industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select></label>
      <ImageUploader label="Primary image" entity="products" value={form.primaryImageUrl} onChange={(url) => setForm({ ...form, primaryImageUrl: url })} />
      <ImageUploader label="Gallery image" entity="products" value={form.imageUrls?.[0]} onChange={(url) => setForm({ ...form, imageUrls: url ? [url] : [] })} />
      <label><input type="checkbox" checked={!!form.isDiscount} onChange={(e) => setForm({ ...form, isDiscount: e.target.checked })} /> Discount</label><label><input type="checkbox" checked={!!form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} /> New arrival</label><label><input type="checkbox" checked={!!form.isFastMoving} onChange={(e) => setForm({ ...form, isFastMoving: e.target.checked })} /> Fast moving</label>
    </div><div className="admin-toolbar"><button className="admin-btn admin-btn-primary" disabled={saving}>{saving && <Loader2 size={14} className="animate-spin" />}Save product</button></div></form></div>}
  </div></AdminLayout>;
}
