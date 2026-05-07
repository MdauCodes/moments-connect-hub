import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { OrderDetailDrawer } from "@/components/admin/OrderDetailDrawer";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import {
  GatewayChip,
  MockBanner,
  ORDER_STATUS_OPTIONS,
  OrderStatusBadge,
  PaymentStatusBadge,
  formatDateShort,
  formatKes,
} from "@/components/admin/commerceUi";
import { listOrders, exportOrders, type ListOrdersResult } from "@/services/commerceApi";
import { downloadCsv, toCsv } from "@/lib/csv";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_adminAuth/admin/orders")({
  component: AdminOrdersPage,
});

const PAGE_SIZE = 20;

function AdminOrdersPage() {
  const [data, setData] = useState<ListOrdersResult | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => { document.title = "Orders · Moments admin"; }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listOrders({ status: status === "ALL" ? undefined : status, q: q || undefined, page, size: PAGE_SIZE })
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [status, q, page]);

  const totals = useMemo(() => {
    if (!data) return { revenue: 0, orders: 0 };
    return {
      revenue: data.rows.reduce((s, o) => s + Number((o as any).totalAmount ?? o.total ?? 0), 0),
      orders: data.total,
    };
  }, [data]);

  return (
    <AdminLayout title="Orders">
      <div className="admin-page-stack">
        {data && <MockBanner source={data.source} />}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }} data-admin-stats>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label">Total orders</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, marginTop: 6 }}>{loading ? "—" : totals.orders}</div>
          </div>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label">Revenue (visible)</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, marginTop: 6 }}>{loading ? "—" : formatKes(totals.revenue)}</div>
          </div>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label">Filtered status</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, marginTop: 6 }}>
              {ORDER_STATUS_OPTIONS.find((o) => o.value === status)?.label}
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-toolbar" data-admin-toolbar>
            <div style={{ display: "flex", gap: 10, flex: 1, flexWrap: "wrap" }}>
              <input
                className="admin-input"
                placeholder="Search by reference, customer, email…"
                value={q}
                onChange={(e) => { setPage(0); setQ(e.target.value); }}
                style={{ maxWidth: 320 }}
                data-admin-search-input
              />
              <select
                className="admin-select"
                value={status}
                onChange={(e) => { setPage(0); setStatus(e.target.value); }}
                style={{ maxWidth: 200 }}
              >
                {ORDER_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button
              className="admin-btn admin-btn-ghost"
              onClick={async () => {
                const { rows } = await exportOrders({ status: status === "ALL" ? undefined : status, q: q || undefined });
                downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows.map((o) => ({
                  reference: o.reference, status: o.status, payment: o.paymentStatus, gateway: o.paymentGateway,
                  customer: o.customerName, email: o.customerEmail, phone: o.customerPhone, city: o.city,
                  items: o.items.length, subtotal: o.subtotal, shipping: o.shippingFee, total: o.total,
                  createdAt: o.createdAt, tracking: o.trackingNumber ?? "",
                }))));
                toast.success(`Exported ${rows.length} orders`);
              }}
            ><Download size={14} style={{ marginRight: 6 }} />Export CSV</button>
          </div>

          <div data-admin-table-scroll>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8}><div className="admin-empty">Loading orders…</div></td></tr>
                ) : !data || data.rows.length === 0 ? (
                  <tr><td colSpan={8}><div className="admin-empty">No orders match your filters.</div></td></tr>
                ) : (
                  data.rows.map((o) => (
                    <tr key={o.id}>
                      <td><b>{o.reference}</b></td>
                      <td>
                        <div>{o.customerName}</div>
                        <div style={{ color: "var(--admin-muted)", fontSize: 11 }}>{o.city}</div>
                      </td>
                      <td>{o.items.reduce((s, it) => s + Number(it.qty ?? 0), 0)} units · {o.items.length} SKU{o.items.length === 1 ? "" : "s"}</td>
                      <td><b>{formatKes(o.total)}</b></td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <PaymentStatusBadge status={o.paymentStatus} />
                        <GatewayChip gateway={o.paymentGateway} />
                      </td>
                      <td>{formatDateShort(o.createdAt)}</td>
                      <td>
                        <button className="admin-btn admin-btn-ghost" onClick={() => setOpenId(o.id)}>View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14 }} data-admin-pagination>
              <div style={{ color: "var(--admin-muted)", fontSize: 12 }}>
                Page {page + 1} of {data.totalPages} · {data.total} orders
              </div>
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
