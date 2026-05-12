import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useAuth } from "@/contexts/AdminAuthContext";
import { adminResources, type IndustryDto, type ProductDto } from "@/services/adminResources";

export const Route = createFileRoute("/_adminAuth/admin/products")({ component: AdminProductsPage });

function AdminProductsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [industries, setIndustries] = useState<IndustryDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ industryId: "", category: "", isDiscount: "", isNewArrival: "", isFastMoving: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [productPage, industryRows] = await Promise.all([
        adminResources.products.list({ ...filters, page, size: 10, sort: "createdAt,desc" }),
        adminResources.industries.list(),
      ]);
      setProducts(productPage.rows);
      setTotalPages(productPage.totalPages);
      setIndustries(industryRows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [page, filters.industryId, filters.category, filters.isDiscount, filters.isNewArrival, filters.isFastMoving]);

  const beginCreate = () => navigate({ to: "/admin/products/new" });
  const beginEdit = (p: ProductDto) => navigate({ to: "/admin/products/$id", params: { id: p.id } });
  const remove = async (p: ProductDto) => {
    if (!isAdmin || !confirm(`Delete ${p.name}?`)) return;
    setSaving(true);
    try {
      await adminResources.products.remove(p.id);
      toast.success("Product deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Products" actionLabel="New product" onAction={beginCreate}>
      <div className="admin-page-stack">
        <div className="admin-panel admin-toolbar" data-admin-toolbar>
          <select
            className="admin-select"
            style={{ maxWidth: 220 }}
            value={filters.industryId}
            onChange={(e) => {
              setPage(0);
              setFilters({ ...filters, industryId: e.target.value });
            }}
          >
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <input
            className="admin-input"
            style={{ maxWidth: 220 }}
            placeholder="Category"
            value={filters.category}
            onChange={(e) => {
              setPage(0);
              setFilters({ ...filters, category: e.target.value });
            }}
          />
          {(["isDiscount", "isNewArrival", "isFastMoving"] as const).map((key) => (
            <button
              key={key}
              className={`admin-btn ${filters[key] ? "admin-btn-primary" : "admin-btn-ghost"}`}
              onClick={() => {
                setPage(0);
                setFilters({ ...filters, [key]: filters[key] ? "" : "true" });
              }}
            >
              {key.replace("is", "")}
            </button>
          ))}
        </div>
        <div className="admin-panel" data-admin-table-scroll>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price (KES)</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Flags</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>Loading products…</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">
                      No products found.{" "}
                      <button className="admin-btn admin-btn-primary" onClick={beginCreate}>
                        Create product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const stock = p.stock ?? 0;
                  const threshold = p.lowStockThreshold ?? 50;
                  const tracking = p.trackInventory ?? true;
                  const stockTone = !tracking
                    ? "var(--admin-muted)"
                    : stock === 0
                      ? "#b91c1c"
                      : stock < threshold
                        ? "#a16207"
                        : "#15803d";
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          {(p.primaryImageUrl || p.imageUrls?.[0]) && (
                            <img
                              src={p.primaryImageUrl || p.imageUrls?.[0]}
                              alt=""
                              style={{ width: 44, height: 38, objectFit: "cover", borderRadius: 6 }}
                            />
                          )}
                          <b>{p.name}</b>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.sku || "—"}</td>
                      <td>{p.basePrice != null ? p.basePrice.toLocaleString() : "—"}</td>
                      <td style={{ color: stockTone, fontWeight: 600 }}>
                        {tracking ? `${stock.toLocaleString()}${stock < threshold ? " ⚠" : ""}` : "Untracked"}
                      </td>
                      <td>{p.category || "—"}</td>
                      <td>
                        {[p.isDiscount && "Discount", p.isNewArrival && "New", p.isFastMoving && "Fast"]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </td>
                      <td>
                        <button className="admin-btn admin-btn-ghost" onClick={() => beginEdit(p)}>
                          <Pencil size={14} />
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            className="admin-btn admin-btn-danger"
                            disabled={saving}
                            onClick={() => void remove(p)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="admin-toolbar">
          <button
            className="admin-btn admin-btn-ghost"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span className="admin-label">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="admin-btn admin-btn-ghost"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
