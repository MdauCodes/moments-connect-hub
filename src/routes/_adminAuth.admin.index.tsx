import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import {
  GatewayChip,
  MockBanner,
  OrderStatusBadge,
  PaymentStatusBadge,
  formatDateShort,
  formatKes,
} from "@/components/admin/commerceUi";
import { getDashboardStats, type DashboardResult } from "@/services/commerceApi";

export const Route = createFileRoute("/_adminAuth/admin/")({ component: AdminDashboardPage });

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Dashboard · Moments admin"; }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboardStats()
      .then((res) => { if (!cancelled) setStats(res); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const delta = stats ? (stats.revenueYesterday > 0
    ? Math.round(((stats.revenueToday - stats.revenueYesterday) / stats.revenueYesterday) * 100)
    : null) : null;

  const tiles = stats ? [
    {
      label: "Revenue today",
      value: formatKes(stats.revenueToday),
      sub: delta === null ? "vs yesterday: —" : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}% vs yesterday`,
      tone: delta === null ? "muted" : delta >= 0 ? "ok" : "warn",
    },
    { label: "Orders today", value: String(stats.ordersToday), sub: `${stats.ordersPending} pending` },
    {
      label: "Payment success (24h)",
      value: `${stats.paymentSuccessRate24h}%`,
      sub: `${stats.ordersFailed} failed payments`,
      tone: stats.paymentSuccessRate24h >= 90 ? "ok" : stats.paymentSuccessRate24h >= 70 ? "warn" : "bad",
    },
    {
      label: "Low-stock SKUs",
      value: String(stats.lowStockCount),
      sub: "Need restocking",
      tone: stats.lowStockCount > 0 ? "warn" : "ok",
    },
    { label: "AOV (7d)", value: formatKes(stats.averageOrderValue7d), sub: "Average order value" },
    { label: "New customers (7d)", value: String(stats.newCustomers7d), sub: "Signed up this week" },
  ] : [];

  const toneColor = (tone?: string) => tone === "ok" ? "#15803d" : tone === "warn" ? "#a16207" : tone === "bad" ? "#b91c1c" : "var(--admin-muted)";

  // Sparkline geometry — tiny inline SVG, no library.
  const series = stats?.revenueSeries7d ?? [];
  const max = Math.max(1, ...series.map((s) => s.revenue));

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-page-stack">
        {stats && <MockBanner source={stats.source} />}

        {/* KPI tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }} data-admin-stats>
          {(loading ? Array.from({ length: 6 }).map((_, i) => ({ label: "Loading…", value: "—", sub: "", tone: undefined, key: i })) : tiles).map((t, i) => (
            <div key={i} className="admin-panel" style={{ padding: 16 }}>
              <div className="admin-label">{t.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, marginTop: 8, lineHeight: 1.1 }}>{t.value}</div>
              <div style={{ fontSize: 11, marginTop: 6, color: toneColor((t as { tone?: string }).tone) }}>{t.sub}</div>
            </div>
          ))}
        </div>

        {/* Revenue chart + top products */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }} data-admin-grid>
          <div className="admin-panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Revenue · last 7 days</h2>
              <div style={{ color: "var(--admin-muted)", fontSize: 12 }}>{stats ? formatKes(stats.revenue7d) : "—"} total</div>
            </div>

            {series.length > 0 && (
              <svg viewBox="0 0 700 200" style={{ width: "100%", height: 200 }} preserveAspectRatio="none">
                {series.map((d, i) => {
                  const barWidth = 700 / series.length - 14;
                  const x = i * (700 / series.length) + 7;
                  const h = (d.revenue / max) * 160;
                  const y = 180 - h;
                  return (
                    <g key={d.date}>
                      <rect x={x} y={y} width={barWidth} height={h} rx={6} fill="var(--admin-accent)" opacity={0.85} />
                      <text x={x + barWidth / 2} y={196} textAnchor="middle" fontSize={11} fill="var(--admin-muted)">{d.date}</text>
                      <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize={10} fill="var(--admin-text)">
                        {d.revenue >= 1000 ? `${Math.round(d.revenue / 1000)}k` : d.revenue}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          <div className="admin-panel" style={{ padding: 18 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", marginBottom: 12 }}>Top products (30d)</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {(stats?.topProducts ?? []).map((p, idx) => (
                <div key={p.productId} style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {idx + 1}. {p.name}
                    </div>
                    <div style={{ color: "var(--admin-muted)", fontSize: 11 }}>{p.unitsSold.toLocaleString()} units</div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>{formatKes(p.revenue)}</div>
                </div>
              ))}
              {!loading && (stats?.topProducts?.length ?? 0) === 0 && <div className="admin-empty" style={{ padding: 16 }}>No sales yet.</div>}
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="admin-panel" data-admin-table-scroll>
          <div className="admin-toolbar">
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Latest orders</h2>
            <Link to="/admin/orders" className="admin-btn admin-btn-ghost">View all</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Reference</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Created</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><div className="admin-empty">Loading…</div></td></tr>
              ) : (stats?.recentOrders ?? []).length === 0 ? (
                <tr><td colSpan={6}><div className="admin-empty">No orders yet.</div></td></tr>
              ) : (
                stats!.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td><Link to="/admin/orders/$id" params={{ id: o.id }}><b>{o.reference}</b></Link></td>
                    <td>{o.customerName}</td>
                    <td><b>{formatKes(o.total)}</b></td>
                    <td><OrderStatusBadge status={o.status} /></td>
                    <td style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <PaymentStatusBadge status={o.paymentStatus} />
                      <GatewayChip gateway={o.paymentGateway} />
                    </td>
                    <td>{formatDateShort(o.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Failed payments + low stock */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} data-admin-grid>
          <div className="admin-panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Failed payments — needs attention</h2>
              <Link to="/admin/payments" className="admin-btn admin-btn-ghost">All payments</Link>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {(stats?.failedPayments ?? []).map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: 10, border: "1px solid var(--admin-border)", borderRadius: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.reference} · {p.customerName}</div>
                    <div style={{ color: "#b91c1c", fontSize: 11 }}>{p.failureReason ?? "Unknown reason"}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>{formatKes(p.amount)}</div>
                </div>
              ))}
              {!loading && (stats?.failedPayments.length ?? 0) === 0 && <div className="admin-empty" style={{ padding: 16 }}>No failed payments. </div>}
            </div>
          </div>

          <div className="admin-panel" style={{ padding: 18 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", marginBottom: 12 }}>Low stock alerts</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {(stats?.lowStockProducts ?? []).map((p) => (
                <div key={p.productId} style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", padding: 10, border: "1px solid var(--admin-border)", borderRadius: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ color: "var(--admin-muted)", fontSize: 11 }}>Threshold: {p.threshold}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: p.stock === 0 ? "#b91c1c" : "#a16207" }}>{p.stock} left</div>
                </div>
              ))}
              {!loading && (stats?.lowStockProducts.length ?? 0) === 0 && <div className="admin-empty" style={{ padding: 16 }}>All stock healthy.</div>}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
