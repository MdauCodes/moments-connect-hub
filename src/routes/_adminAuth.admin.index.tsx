import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MockBanner, formatKes } from "@/components/admin/commerceUi";
import { getDashboardStats, type DashboardResult } from "@/services/commerceApi";

export const Route = createFileRoute("/_adminAuth/admin/")({ component: AdminDashboardPage });

type ApiStats = DashboardResult & {
  revenueMTD?: number;
  topSellingProducts?: string[];
};

export function AdminDashboardPage() {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Dashboard · Moments admin"; }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboardStats()
      .then((res) => { if (!cancelled) setStats(res as ApiStats); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const tiles = stats ? [
    typeof stats.revenueToday === "number" && {
      label: "Revenue today",
      value: formatKes(stats.revenueToday),
      sub: "",
    },
    typeof stats.ordersToday === "number" && {
      label: "Orders today",
      value: String(stats.ordersToday),
      sub: typeof stats.ordersPending === "number" ? `${stats.ordersPending} pending` : "",
    },
    typeof stats.revenueMTD === "number" && {
      label: "Revenue MTD",
      value: formatKes(stats.revenueMTD),
      sub: "Month to date",
    },
  ].filter(Boolean) as { label: string; value: string; sub: string }[] : [];

  const topProducts = stats?.topSellingProducts ?? [];

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-page-stack">
        {stats && <MockBanner source={stats.source} />}

        {/* KPI tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }} data-admin-stats>
          {(loading
            ? Array.from({ length: 3 }).map((_, i) => ({ label: "Loading…", value: "—", sub: "", key: i }))
            : tiles
          ).map((t, i) => (
            <div key={i} className="admin-panel" style={{ padding: 16 }}>
              <div className="admin-label">{t.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, marginTop: 8, lineHeight: 1.1 }}>{t.value}</div>
              {t.sub && <div style={{ fontSize: 11, marginTop: 6, color: "var(--admin-muted)" }}>{t.sub}</div>}
            </div>
          ))}
        </div>

        {/* Top products */}
        <div className="admin-panel" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Top products (30d)</h2>
            <Link to="/admin/products" className="admin-btn admin-btn-ghost">All products</Link>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {topProducts.map((name, idx) => (
              <div key={`${name}-${idx}`} style={{ display: "flex", gap: 8, alignItems: "center", padding: 10, border: "1px solid var(--admin-border)", borderRadius: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{idx + 1}. {name}</div>
              </div>
            ))}
            {!loading && topProducts.length === 0 && <div className="admin-empty" style={{ padding: 16 }}>No sales data yet.</div>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
