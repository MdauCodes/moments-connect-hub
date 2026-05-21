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
  const safeData = data ?? [];
  const w = 800, h = 220, pad = 32;
  const max = Math.max(1, ...safeData.map((d) => d?.revenue ?? 0));
  const stepX = (w - pad * 2) / Math.max(1, safeData.length - 1);
  const points = safeData.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((d?.revenue ?? 0) / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const area = `${pad},${h - pad} ${points} ${pad + (safeData.length - 1) * stepX},${h - pad}`;
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
      {safeData.map((d, i) => {
        const x = pad + i * stepX;
        return <text key={i} x={x} y={h - 8} fontSize="9" fill="var(--admin-muted)" textAnchor="middle">{d?.date ?? ""}</text>;
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

  const kpis = data?.kpis;
  const revenueDelta = useMemo(() =>
    kpis ? deltaPct(kpis.revenue ?? 0, kpis.revenuePrev ?? 0) : undefined,
  [kpis]);
  const ordersDelta = useMemo(() =>
    kpis ? deltaPct(kpis.orders ?? 0, kpis.ordersPrev ?? 0) : undefined,
  [kpis]);

  async function handleExport(kind: "orders" | "customers" | "revenue") {
    try {
      setExporting(kind);
      const stamp = new Date().toISOString().slice(0, 10);
      if (kind === "orders") {
        const { rows } = await exportOrders();
        const flat = rows.map((o) => ({
          reference: o?.reference ?? "", status: o?.status ?? "", payment: o?.paymentStatus ?? "", gateway: o?.paymentGateway ?? "",
          customer: o?.customerName ?? "", email: o?.customerEmail ?? "", phone: o?.customerPhone ?? "", city: o?.city ?? "",
          items: o?.items?.length ?? 0, subtotal: o?.subtotal ?? 0, shipping: o?.shippingFee ?? 0, total: o?.total ?? 0,
          createdAt: o?.createdAt ?? "", tracking: o?.trackingNumber ?? "",
        }));
        downloadCsv(`orders-${stamp}.csv`, toCsv(flat));
      } else if (kind === "customers") {
        const { rows } = await exportCustomers();
        downloadCsv(`customers-${stamp}.csv`, toCsv(rows.map((c) => ({
          name: c?.name ?? "", email: c?.email ?? "", phone: c?.phone ?? "", city: c?.city ?? "", segment: c?.segment ?? "", status: c?.status ?? "",
          orders: c?.ordersCount ?? 0, lifetimeValue: c?.lifetimeValue ?? 0, aov: c?.averageOrderValue ?? 0,
          firstOrder: c?.firstOrderAt ?? "", lastOrder: c?.lastOrderAt ?? "",
        }))));
      } else if (kind === "revenue" && data) {
        const series = data?.revenueSeries ?? [];
        downloadCsv(`revenue-${days}d-${stamp}.csv`, toCsv(series.map((r) => ({
          date: r?.iso?.slice(0, 10) ?? "", revenue: r?.revenue ?? 0, orders: r?.orders ?? 0, aov: r?.aov ?? 0,
        }))));
      }
      toast.success(`Exported ${kind}.csv`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  const revenueVal = kpis?.revenue ?? 0;
  const ordersVal = kpis?.orders ?? 0;
  const aovVal = kpis?.aov ?? 0;
  const customersVal = kpis?.customers ?? 0;
  const conversionRateVal = kpis?.conversionRate ?? 0;
  const cartAbandonVal = kpis?.cartAbandonRate ?? 0;
  const paymentSuccessVal = kpis?.paymentSuccessRate ?? 0;
  const refundRateVal = kpis?.refundRate ?? 0;
  const revenuePrevVal = kpis?.revenuePrev ?? 0;
  const ordersPrevVal = kpis?.ordersPrev ?? 0;

  return (
    <AdminLayout title="Analytics">
      <div className="admin-page-stack">
        {data && <MockBanner source={data?.source} />}

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
            <button className="admin-btn admin-btn-ghost" disabled={!!exporting} onClick={() => handleExport("customers")}>
              <Download size={14} style={{ marginRight: 6 }} />Customers CSV
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }} data-admin-stats>
          <KpiCard label="Revenue" value={loading || !kpis ? "—" : formatKes(revenueVal)} sub={`vs ${formatKes(revenuePrevVal)} prior`} delta={revenueDelta} />
          <KpiCard label="Orders" value={loading || !kpis ? "—" : String(ordersVal)} sub={`vs ${ordersPrevVal} prior`} delta={ordersDelta} />
          <KpiCard label="Avg order value" value={loading || !kpis ? "—" : formatKes(aovVal)} />
          <KpiCard label="Customers" value={loading || !kpis ? "—" : String(customersVal)} sub="distinct buyers" />
          <KpiCard label="Conversion rate" value={loading || !kpis ? "—" : `${conversionRateVal}%`} sub="sessions → paid" />
          <KpiCard label="Cart abandon" value={loading || !kpis ? "—" : `${cartAbandonVal}%`} sub="add-to-cart → order" />
          <KpiCard label="Payment success" value={loading || !kpis ? "—" : `${paymentSuccessVal}%`} sub="all gateways" />
          <KpiCard label="Refund rate" value={loading || !kpis ? "—" : `${refundRateVal}%`} sub="of orders" />
        </div>

        {/* Revenue chart */}
        <div className="admin-panel" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div className="admin-label">Revenue</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{loading || !kpis ? "—" : formatKes(revenueVal)}</div>
            </div>
          </div>
          {data && <RevenueChart data={data?.revenueSeries ?? []} />}
        </div>

        {/* Two-column row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label" style={{ marginBottom: 10 }}>Conversion funnel</div>
            {!data ? <div className="admin-empty">Loading…</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(data?.funnel ?? []).map((s, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span>{s?.stage ?? "—"}</span>
                      <span style={{ color: "var(--admin-muted)" }}>{(s?.value ?? 0).toLocaleString()} · {s?.pct ?? 0}%</span>
                    </div>
                    <Bar pct={s?.pct ?? 0} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label" style={{ marginBottom: 10 }}>Sales channels</div>
            {!data ? <div className="admin-empty">Loading…</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(data?.channels ?? []).map((c, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span>{c?.channel ?? "—"}</span>
                      <span style={{ color: "var(--admin-muted)" }}>{formatKes(c?.revenue ?? 0)} · {c?.share ?? 0}%</span>
                    </div>
                    <Bar pct={c?.share ?? 0} />
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
                  {(data?.categories ?? []).map((c, idx) => (
                    <tr key={idx}><td>{c?.category ?? "—"}</td><td>{(c?.units ?? 0).toLocaleString()}</td><td><b>{formatKes(c?.revenue ?? 0)}</b></td></tr>
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
                  {(data?.topCities ?? []).map((c, idx) => (
                    <tr key={idx}><td>{c?.city ?? "—"}</td><td>{c?.orders ?? 0}</td><td><b>{formatKes(c?.revenue ?? 0)}</b></td></tr>
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
                  {(data?.paymentMethods ?? []).map((m, idx) => (
                    <tr key={idx}>
                      <td>{m?.gateway ?? "—"}</td>
                      <td>{m?.success ?? 0} <span style={{ color: "var(--admin-muted)", fontSize: 10 }}>({m?.successRate ?? 0}%)</span></td>
                      <td>{m?.failed ?? 0}</td>
                      <td><b>{formatKes(m?.revenue ?? 0)}</b></td>
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
                {(data?.topProducts ?? []).map((p, idx) => {
                  const share = revenueVal ? ((p?.revenue ?? 0) / revenueVal) * 100 : 0;
                  return (
                    <tr key={idx}>
                      <td>{p?.name ?? "—"}</td>
                      <td>{(p?.units ?? 0).toLocaleString()}</td>
                      <td><b>{formatKes(p?.revenue ?? 0)}</b></td>
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
