import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MockBanner, formatKes } from "@/components/admin/commerceUi";
import {
  getAnalyticsOverview, exportOrders, exportCustomers,
  type AnalyticsResult,
} from "@/services/commerceApi";
import { downloadCsv, toCsv } from "@/lib/csv";

export const Route = createFileRoute("/_adminAuth/admin/analytics")({
  component: AdminAnalyticsPage,
});

const RANGE_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

function deltaPct(curr: number, prev: number): { value: number; positive: boolean } {
  if (!prev) return { value: curr ? 100 : 0, positive: curr >= 0 };
  const v = ((curr - prev) / prev) * 100;
  return { value: Math.round(v * 10) / 10, positive: v >= 0 };
}

function KpiCard({ label, value, sub, delta }: { label: string; value: string; sub?: string; delta?: { value: number; positive: boolean } }) {
  return (
    <div className="admin-panel" style={{ padding: 16 }}>
      <div className="admin-label">{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 6 }}>{value}</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <div style={{ fontSize: 11, color: "var(--admin-muted)" }}>{sub ?? ""}</div>
        {delta !== undefined && (
          <div style={{ fontSize: 11, fontWeight: 600, color: delta.positive ? "#15803d" : "#b91c1c" }}>
            {delta.positive ? "▲" : "▼"} {Math.abs(delta.value)}%
          </div>
        )}
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: AnalyticsResult["revenueSeries"] }) {
  const w = 800, h = 220, pad = 32;
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const stepX = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (d.revenue / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const area = `${pad},${h - pad} ${points} ${pad + (data.length - 1) * stepX},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--admin-accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--admin-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#rev-grad)" />
      <polyline points={points} fill="none" stroke="var(--admin-accent)" strokeWidth="2" />
      {data.map((d, i) => {
        const x = pad + i * stepX;
        return <text key={i} x={x} y={h - 8} fontSize="9" fill="var(--admin-muted)" textAnchor="middle">{d.date}</text>;
      })}
    </svg>
  );
}

function Bar({ pct, color = "var(--admin-accent)" }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 8, borderRadius: 999, background: "var(--admin-surface-2)", overflow: "hidden" }}>
      <div style={{ width: `${Math.max(2, Math.min(100, pct))}%`, height: "100%", background: color }} />
    </div>
  );
}

function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => { document.title = "Analytics · Moments admin"; }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAnalyticsOverview(days)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load analytics"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  const revenueDelta = useMemo(() => data ? deltaPct(data.kpis.revenue, data.kpis.revenuePrev) : undefined, [data]);
  const ordersDelta = useMemo(() => data ? deltaPct(data.kpis.orders, data.kpis.ordersPrev) : undefined, [data]);

  async function handleExport(kind: "orders" | "payments" | "customers" | "revenue") {
    try {
      setExporting(kind);
      const stamp = new Date().toISOString().slice(0, 10);
      if (kind === "orders") {
        const { rows } = await exportOrders();
        const flat = rows.map((o) => ({
          reference: o.reference, status: o.status, payment: o.paymentStatus, gateway: o.paymentGateway,
          customer: o.customerName, email: o.customerEmail, phone: o.customerPhone, city: o.city,
          items: o.items.length, subtotal: o.subtotal, shipping: o.shippingFee, total: o.total,
          createdAt: o.createdAt, tracking: o.trackingNumber ?? "",
        }));
        downloadCsv(`orders-${stamp}.csv`, toCsv(flat));
      } else if (kind === "payments") {
        const { rows } = await exportPayments();
        downloadCsv(`payments-${stamp}.csv`, toCsv(rows.map((p) => ({
          reference: p.reference, orderReference: p.orderReference, gateway: p.gateway,
          status: p.status, amount: p.amount, customer: p.customerName, phone: p.customerPhone ?? "",
          gatewayReference: p.gatewayReference ?? "", failureReason: p.failureReason ?? "", createdAt: p.createdAt,
        }))));
      } else if (kind === "customers") {
        const { rows } = await exportCustomers();
        downloadCsv(`customers-${stamp}.csv`, toCsv(rows.map((c) => ({
          name: c.name, email: c.email, phone: c.phone, city: c.city, segment: c.segment, status: c.status,
          orders: c.ordersCount, lifetimeValue: c.lifetimeValue, aov: c.averageOrderValue,
          firstOrder: c.firstOrderAt ?? "", lastOrder: c.lastOrderAt ?? "",
        }))));
      } else if (kind === "revenue" && data) {
        downloadCsv(`revenue-${days}d-${stamp}.csv`, toCsv(data.revenueSeries.map((r) => ({
          date: r.iso.slice(0, 10), revenue: r.revenue, orders: r.orders, aov: r.aov,
        }))));
      }
      toast.success(`Exported ${kind}.csv`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <AdminLayout title="Analytics">
      <div className="admin-page-stack">
        {data && <MockBanner source={data.source} />}

        <div className="admin-panel" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="admin-label">Range</span>
            <select className="admin-select" value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ width: 180 }}>
              {RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="admin-btn admin-btn-ghost" disabled={!!exporting} onClick={() => handleExport("revenue")}>
              <Download size={14} style={{ marginRight: 6 }} />Revenue CSV
            </button>
            <button className="admin-btn admin-btn-ghost" disabled={!!exporting} onClick={() => handleExport("orders")}>
              <Download size={14} style={{ marginRight: 6 }} />Orders CSV
            </button>
            <button className="admin-btn admin-btn-ghost" disabled={!!exporting} onClick={() => handleExport("payments")}>
              <Download size={14} style={{ marginRight: 6 }} />Payments CSV
            </button>
            <button className="admin-btn admin-btn-ghost" disabled={!!exporting} onClick={() => handleExport("customers")}>
              <Download size={14} style={{ marginRight: 6 }} />Customers CSV
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }} data-admin-stats>
          <KpiCard label="Revenue" value={loading || !data ? "—" : formatKes(data.kpis.revenue)} sub={`vs ${formatKes(data?.kpis.revenuePrev ?? 0)} prior`} delta={revenueDelta} />
          <KpiCard label="Orders" value={loading || !data ? "—" : String(data.kpis.orders)} sub={`vs ${data?.kpis.ordersPrev ?? 0} prior`} delta={ordersDelta} />
          <KpiCard label="Avg order value" value={loading || !data ? "—" : formatKes(data.kpis.aov)} />
          <KpiCard label="Customers" value={loading || !data ? "—" : String(data.kpis.customers)} sub="distinct buyers" />
          <KpiCard label="Conversion rate" value={loading || !data ? "—" : `${data.kpis.conversionRate}%`} sub="sessions → paid" />
          <KpiCard label="Cart abandon" value={loading || !data ? "—" : `${data.kpis.cartAbandonRate}%`} sub="add-to-cart → order" />
          <KpiCard label="Payment success" value={loading || !data ? "—" : `${data.kpis.paymentSuccessRate}%`} sub="all gateways" />
          <KpiCard label="Refund rate" value={loading || !data ? "—" : `${data.kpis.refundRate}%`} sub="of orders" />
        </div>

        {/* Revenue chart */}
        <div className="admin-panel" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div className="admin-label">Revenue</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{loading || !data ? "—" : formatKes(data.kpis.revenue)}</div>
            </div>
          </div>
          {data && <RevenueChart data={data.revenueSeries} />}
        </div>

        {/* Two-column row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label" style={{ marginBottom: 10 }}>Conversion funnel</div>
            {!data ? <div className="admin-empty">Loading…</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.funnel.map((s) => (
                  <div key={s.stage}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span>{s.stage}</span>
                      <span style={{ color: "var(--admin-muted)" }}>{s.value.toLocaleString()} · {s.pct}%</span>
                    </div>
                    <Bar pct={s.pct} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label" style={{ marginBottom: 10 }}>Sales channels</div>
            {!data ? <div className="admin-empty">Loading…</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.channels.map((c) => (
                  <div key={c.channel}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span>{c.channel}</span>
                      <span style={{ color: "var(--admin-muted)" }}>{formatKes(c.revenue)} · {c.share}%</span>
                    </div>
                    <Bar pct={c.share} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Three-column row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label" style={{ marginBottom: 10 }}>Top categories</div>
            {!data ? <div className="admin-empty">Loading…</div> : (
              <table className="admin-table">
                <thead><tr><th>Category</th><th>Units</th><th>Revenue</th></tr></thead>
                <tbody>
                  {data.categories.map((c) => (
                    <tr key={c.category}><td>{c.category}</td><td>{c.units.toLocaleString()}</td><td><b>{formatKes(c.revenue)}</b></td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label" style={{ marginBottom: 10 }}>Top cities</div>
            {!data ? <div className="admin-empty">Loading…</div> : (
              <table className="admin-table">
                <thead><tr><th>City</th><th>Orders</th><th>Revenue</th></tr></thead>
                <tbody>
                  {data.topCities.map((c) => (
                    <tr key={c.city}><td>{c.city}</td><td>{c.orders}</td><td><b>{formatKes(c.revenue)}</b></td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label" style={{ marginBottom: 10 }}>Payment methods</div>
            {!data ? <div className="admin-empty">Loading…</div> : (
              <table className="admin-table">
                <thead><tr><th>Method</th><th>Success</th><th>Failed</th><th>Revenue</th></tr></thead>
                <tbody>
                  {data.paymentMethods.map((m) => (
                    <tr key={m.gateway}>
                      <td>{m.gateway}</td>
                      <td>{m.success} <span style={{ color: "var(--admin-muted)", fontSize: 10 }}>({m.successRate}%)</span></td>
                      <td>{m.failed}</td>
                      <td><b>{formatKes(m.revenue)}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="admin-panel" style={{ padding: 16 }}>
          <div className="admin-label" style={{ marginBottom: 10 }}>Top products by revenue</div>
          {!data ? <div className="admin-empty">Loading…</div> : (
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Units sold</th><th>Revenue</th><th>Share of revenue</th></tr></thead>
              <tbody>
                {data.topProducts.map((p) => {
                  const share = data.kpis.revenue ? (p.revenue / data.kpis.revenue) * 100 : 0;
                  return (
                    <tr key={p.productId}>
                      <td>{p.name}</td>
                      <td>{p.units.toLocaleString()}</td>
                      <td><b>{formatKes(p.revenue)}</b></td>
                      <td style={{ width: 220 }}><Bar pct={share} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
