import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import {
  GATEWAY_OPTIONS,
  GatewayChip,
  MockBanner,
  PAYMENT_STATUS_OPTIONS,
  PaymentStatusBadge,
  formatDate,
  formatKes,
} from "@/components/admin/commerceUi";
import { listPayments, exportPayments, type ListPaymentsResult } from "@/services/commerceApi";
import { downloadCsv, toCsv } from "@/lib/csv";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_adminAuth/admin/payments")({
  component: AdminPaymentsPage,
});

const PAGE_SIZE = 20;

function AdminPaymentsPage() {
  const [data, setData] = useState<ListPaymentsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("ALL");
  const [gateway, setGateway] = useState<string>("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => { document.title = "Payments · Moments admin"; }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listPayments({ status, gateway, q, page, size: PAGE_SIZE })
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load payments"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [status, gateway, q, page]);

  const stats = useMemo(() => {
    if (!data) return null;
    const success = data.rows.filter((p) => p.status === "PAID");
    const failed = data.rows.filter((p) => p.status === "FAILED");
    const refunded = data.rows.filter((p) => p.status === "REFUNDED");
    return {
      total: data.total,
      successAmount: success.reduce((s, p) => s + p.amount, 0),
      failedCount: failed.length,
      refundedAmount: refunded.reduce((s, p) => s + p.amount, 0),
      successRate: data.rows.length ? Math.round((success.length / data.rows.length) * 100) : 0,
    };
  }, [data]);

  return (
    <AdminLayout title="Payments">
      <div className="admin-page-stack">
        {data && <MockBanner source={data.source} />}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }} data-admin-stats>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label">Successful (visible)</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 6 }}>{loading || !stats ? "—" : formatKes(stats.successAmount)}</div>
          </div>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label">Failed</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 6, color: "#b91c1c" }}>{loading || !stats ? "—" : stats.failedCount}</div>
          </div>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label">Refunded</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 6 }}>{loading || !stats ? "—" : formatKes(stats.refundedAmount)}</div>
          </div>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label">Success rate</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, marginTop: 6 }}>{loading || !stats ? "—" : `${stats.successRate}%`}</div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-toolbar" data-admin-toolbar>
            <div style={{ display: "flex", gap: 10, flex: 1, flexWrap: "wrap" }}>
              <input
                className="admin-input"
                placeholder="Search by payment ref, order ref, customer…"
                value={q}
                onChange={(e) => { setPage(0); setQ(e.target.value); }}
                style={{ maxWidth: 320 }}
                data-admin-search-input
              />
              <select className="admin-select" value={status} onChange={(e) => { setPage(0); setStatus(e.target.value); }} style={{ maxWidth: 180 }}>
                {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="admin-select" value={gateway} onChange={(e) => { setPage(0); setGateway(e.target.value); }} style={{ maxWidth: 180 }}>
                {GATEWAY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button className="admin-btn admin-btn-ghost" onClick={async () => {
              const { rows } = await exportPayments({ status, gateway, q });
              downloadCsv(`payments-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows.map((p) => ({
                reference: p.reference, orderReference: p.orderReference, gateway: p.gateway, status: p.status,
                amount: p.amount, customer: p.customerName, phone: p.customerPhone ?? "",
                gatewayReference: p.gatewayReference ?? "", failureReason: p.failureReason ?? "", createdAt: p.createdAt,
              }))));
              toast.success(`Exported ${rows.length} payments`);
            }}><Download size={14} style={{ marginRight: 6 }} />Export CSV</button>
          </div>

          <div data-admin-table-scroll>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Gateway</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8}><div className="admin-empty">Loading payments…</div></td></tr>
                ) : !data || data.rows.length === 0 ? (
                  <tr><td colSpan={8}><div className="admin-empty">No payments match your filters.</div></td></tr>
                ) : (
                  data.rows.map((p) => (
                    <tr key={p.id}>
                      <td><b>{p.reference}</b></td>
                      <td>{p.orderReference}</td>
                      <td>
                        <div>{p.customerName}</div>
                        {p.customerPhone && <div style={{ color: "var(--admin-muted)", fontSize: 11 }}>{p.customerPhone}</div>}
                      </td>
                      <td><GatewayChip gateway={p.gateway} /></td>
                      <td><b>{formatKes(p.amount)}</b></td>
                      <td>
                        <PaymentStatusBadge status={p.status} />
                        {p.failureReason && <div style={{ color: "#b91c1c", fontSize: 11, marginTop: 4 }}>{p.failureReason}</div>}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 11 }}>{p.gatewayReference ?? "—"}</td>
                      <td>{formatDate(p.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14 }} data-admin-pagination>
              <div style={{ color: "var(--admin-muted)", fontSize: 12 }}>Page {page + 1} of {data.totalPages} · {data.total} payments</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="admin-btn admin-btn-ghost" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</button>
                <button className="admin-btn admin-btn-ghost" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
