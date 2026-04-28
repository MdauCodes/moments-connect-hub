import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Plus, Pencil, Trash2, Tag, Sparkles, Flame } from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { productStore } from "@/services/productStore";
import { categories } from "@/data/products";
import type { Product } from "@/data/products";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_adminAuth/admin/products")({
  component: AdminProductsPage,
});

const styles: Record<string, CSSProperties> = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  search: {
    background: "var(--admin-bg)",
    border: "1px solid #1E2535",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    color: "var(--admin-text)",
    width: 260,
    outline: "none",
    fontFamily: "inherit",
  },
  filterRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "var(--admin-surface)",
    border: "1px solid #1E2535",
    borderRadius: 10,
    overflow: "hidden",
  },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "var(--admin-muted)",
    background: "var(--admin-bg)",
    borderBottom: "1px solid #1E2535",
  },
  td: {
    padding: "12px 14px",
    fontSize: 12.5,
    color: "var(--admin-text)",
    borderBottom: "1px solid #1E2535",
    verticalAlign: "middle" as const,
  },
  productCell: { display: "flex", alignItems: "center", gap: 10 },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    objectFit: "cover" as const,
    background: "var(--admin-bg)",
  },
  productName: { fontSize: 13, fontWeight: 500, color: "var(--admin-text)" },
  productSlug: { fontSize: 11, color: "var(--admin-muted)", marginTop: 2 },
  flagRow: { display: "flex", gap: 6 },
  rowActions: { display: "flex", gap: 8, justifyContent: "flex-end" },
  iconBtn: {
    background: "var(--admin-border)",
    border: "1px solid #2A3448",
    color: "var(--admin-muted)",
    borderRadius: 6,
    padding: 6,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
  },
  iconBtnDanger: {
    background: "color-mix(in oklab, var(--admin-clay) 22%, var(--admin-bg))",
    border: "1px solid #5A2A2A",
    color: "var(--admin-clay)",
    borderRadius: 6,
    padding: 6,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
  },
  emptyState: {
    background: "var(--admin-surface)",
    border: "1px dashed #1E2535",
    borderRadius: 10,
    padding: 40,
    textAlign: "center",
    color: "var(--admin-muted)",
    fontSize: 13,
  },
  emptyCta: {
    marginTop: 14,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "var(--admin-accent)",
    color: "var(--cream)",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "none",
  },
};

function chipStyle(active: boolean): CSSProperties {
  return {
    border: `1px solid ${active ? "var(--admin-accent)" : "var(--admin-border)"}`,
    background: active ? "color-mix(in oklab, var(--admin-accent) 34%, var(--admin-surface))" : "var(--admin-border)",
    color: active ? "var(--admin-accent-hover)" : "var(--admin-muted)",
    borderRadius: 999,
    padding: "5px 12px",
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

function flagStyle(color: string, bg: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: bg,
    color: color,
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: 10,
    fontWeight: 600,
  };
}

function categoryName(slug: string): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

function AdminProductsPage() {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const canCreate = can(user?.role, "product:create");
  const canDelete = can(user?.role, "product:delete");

  const [products, setProducts] = useState<Product[] | null>(null);
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<string | "ALL">("ALL");

  const refresh = async () => {
    const all = await productStore.list();
    setProducts(all);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (activeCat !== "ALL" && p.category !== activeCat) return false;
      if (!q) return true;
      const needle = q.toLowerCase();
      return (
        p.name.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle)
      );
    });
  }, [products, activeCat, q]);

  const handleDelete = async (p: Product) => {
    if (!canDelete) return;
    if (!confirm(`Delete "${p.name}" permanently? This cannot be undone.`)) return;
    await productStore.remove(p.id);
    await refresh();
  };

  return (
    <AdminLayout
      title="Products"
      actionLabel={canCreate ? "+ New product" : undefined}
      onAction={canCreate ? () => navigate({ to: "/admin/products/new" }) : undefined}
    >
      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="Search by name, slug or description…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span style={{ fontSize: 11.5, color: "var(--admin-muted)" }}>
          {products ? `${filtered.length} of ${products.length}` : "Loading…"}
        </span>
      </div>

      <div style={styles.filterRow}>
        <button
          type="button"
          style={chipStyle(activeCat === "ALL")}
          onClick={() => setActiveCat("ALL")}
        >
          All categories
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            style={chipStyle(activeCat === c.slug)}
            onClick={() => setActiveCat(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {products === null ? (
        <div style={styles.emptyState}>Loading products…</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          {q || activeCat !== "ALL" ? (
            "No products match these filters."
          ) : (
            <>
              No products yet.
              {canCreate && (
                <div>
                  <Link to="/admin/products/new" style={styles.emptyCta}>
                    <Plus size={14} /> Create your first product
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>MOQ</th>
              <th style={styles.th}>Flags</th>
              <th style={styles.th}>Monthly clicks</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={styles.td}>
                  <div style={styles.productCell}>
                    {p.image ? (
                      <img src={p.image} alt="" style={styles.thumb} />
                    ) : (
                      <div style={{ ...styles.thumb, border: "1px dashed #1E2535" }} />
                    )}
                    <div>
                      <div style={styles.productName}>{p.name}</div>
                      <div style={styles.productSlug}>/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>{categoryName(p.category)}</td>
                <td style={styles.td}>{p.moq.toLocaleString()}</td>
                <td style={styles.td}>
                  <div style={styles.flagRow}>
                    {p.isDiscount && (
                      <span style={flagStyle("var(--admin-clay)", "color-mix(in oklab, var(--admin-clay) 22%, var(--admin-bg))")}>
                        <Tag size={10} /> -{p.discountPercent ?? 0}%
                      </span>
                    )}
                    {p.isNewArrival && (
                      <span style={flagStyle("var(--admin-clay)", "color-mix(in oklab, var(--admin-clay) 24%, var(--admin-surface))")}>
                        <Sparkles size={10} /> New
                      </span>
                    )}
                    {p.isFastMoving && (
                      <span style={flagStyle("var(--admin-kraft)", "color-mix(in oklab, var(--admin-kraft) 18%, var(--admin-bg))")}>
                        <Flame size={10} /> Fast
                      </span>
                    )}
                  </div>
                </td>
                <td style={styles.td}>{p.monthlyClicks.toLocaleString()}</td>
                <td style={styles.td}>
                  <div style={styles.rowActions}>
                    <Link
                      to="/admin/products/$id"
                      params={{ id: p.id }}
                      style={styles.iconBtn}
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil size={13} />
                    </Link>
                    {canDelete && (
                      <button
                        type="button"
                        style={styles.iconBtnDanger}
                        onClick={() => void handleDelete(p)}
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
