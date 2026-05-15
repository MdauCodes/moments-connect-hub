import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Boxes, Gift, Percent, Ticket } from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MockBanner, formatKes } from "@/components/admin/commerceUi";
import { getDashboardStats, type DashboardResult } from "@/services/commerceApi";

const upcomingModules = [
  { icon: Boxes, label: "Stock & Inventory", desc: "Live stock levels, low-stock alerts, batch & variant tracking." },
  { icon: Gift, label: "Referrals", desc: "Customer referral codes, rewards wallet & redemption flow." },
  { icon: Percent, label: "Commissions", desc: "Sales rep & partner commission tracking and payouts." },
  { icon: Ticket, label: "Coupons & Promos", desc: "Discount codes, campaign rules and usage analytics." },
];

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

        {/* Coming soon */}
        <div className="admin-panel" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Coming soon</h2>
            <span style={{ fontSize: 11, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Roadmap · Q3</span>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--admin-muted)" }}>
            Modules currently in design — they'll appear in the sidebar once shipped.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {upcomingModules.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                style={{
                  position: "relative",
                  padding: 14,
                  border: "1px dashed var(--admin-border)",
                  borderRadius: 10,
                  background: "var(--admin-surface-2, transparent)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--admin-accent)", color: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={14} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-text)" }}>{label}</div>
                  <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 999, background: "var(--admin-clay)", color: "var(--cream)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Soon</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--admin-muted)", lineHeight: 1.45 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
