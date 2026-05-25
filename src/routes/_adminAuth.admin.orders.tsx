import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { OrderDetailDrawer } from "@/components/admin/OrderDetailDrawer";
import { AssignSelect } from "@/components/admin/AssignSelect";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import {
  GatewayChip,
  ORDER_STATUS_OPTIONS,
  OrderStatusBadge,
  PaymentStatusBadge,
  formatDateShort,
  formatKes,
} from "@/components/admin/commerceUi";
import { useAdminOrders } from "@/contexts/AdminOrdersContext";
import { useAuth } from "@/contexts/AdminAuthContext";
import { PERM } from "@/lib/permissions";
import { QueueFreshness } from "@/components/admin/QueueFreshness";
import { downloadCsv, toCsv } from "@/lib/csv";
import { downloadOrdersListPdf } from "@/lib/pdf";
import { Download, FileText } from "lucide-react";

export const Route = createFileRoute("/_adminAuth/admin/orders")({
  component: AdminOrdersPage,
});

const PAGE_SIZE = 20;

function AdminOrdersPage() {
  const { orders, initialLoading, error, refresh, applyOrderPatch } = useAdminOrders();
  const { user, hasPermission } = useAuth();
  const canAssign = hasPermission(PERM.ORDER_ASSIGN) || hasPermission(PERM.ORDER_MANAGE_ALL);
  const currentUserId = user?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("ALL");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(0);
  const [scope, setScope] = useState<"ALL" | "MINE">("ALL");

  useEffect(() => { document.title = "Orders · Moments admin"; }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Client-side filtering against the shared orders cache.
  const filteredRows = useMemo(() => {
    const needle = debouncedQ.toLowerCase();
    return orders.filter((o) => {
      if (scope === "MINE" && (!currentUserId || o.assignedToId !== currentUserId)) return false;
      if (status !== "ALL" && o.status !== status) return false;
      if (!needle) return true;
      return [o.reference, o.customerName, o.customerEmail, o.customerPhone, o.city, o.trackingNumber]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [orders, scope, currentUserId, status, debouncedQ]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = useMemo(
    () => filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filteredRows, page],
  );

  // Clamp page when filters shrink the result set.
  useEffect(() => {
    if (page > 0 && page >= totalPages) setPage(0);
  }, [page, totalPages]);

  const totals = useMemo(
    () => ({
      revenue: filteredRows.reduce((s, o) => s + Number(o.total ?? 0), 0),
      orders: filteredRows.length,
    }),
    [filteredRows],
  );

  return (
    <AdminLayout title="Orders" onReload={() => void refresh()}>
      <div className="admin-page-stack">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }} data-admin-stats>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label">Total orders</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, marginTop: 6 }}>{initialLoading ? "—" : totals.orders}</div>
          </div>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label">Revenue (visible)</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, marginTop: 6 }}>{initialLoading ? "—" : formatKes(totals.revenue)}</div>
          </div>
          <div className="admin-panel" style={{ padding: 16 }}>
            <div className="admin-label">Filtered status</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, marginTop: 6 }}>
              {ORDER_STATUS_OPTIONS.find((o) => o.value === status)?.label}
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <QueueFreshness />
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
              onClick={() => {
                downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(filteredRows.map((o) => ({
                  reference: o.reference, status: o.status, payment: o.paymentStatus, gateway: o.paymentGateway,
                  customer: o.customerName, email: o.customerEmail, phone: o.customerPhone, city: o.city,
                  items: o.items.length, subtotal: o.subtotal, shipping: o.shippingFee, total: o.total,
                  createdAt: o.createdAt, tracking: o.trackingNumber ?? "",
                }))));
                toast.success(`Exported ${filteredRows.length} orders`);
              }}
            ><Download size={14} style={{ marginRight: 6 }} />Export CSV</button>
            <button
              className="admin-btn admin-btn-ghost"
              onClick={() => {
                downloadOrdersListPdf(filteredRows, {
                  filterLabel: ORDER_STATUS_OPTIONS.find((o) => o.value === status)?.label,
                });
                toast.success(`PDF report for ${filteredRows.length} orders`);
              }}
            ><FileText size={14} style={{ marginRight: 6 }} />Export PDF</button>
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
                {initialLoading ? (
                  <tr><td colSpan={8}><div className="admin-empty">Loading orders…</div></td></tr>
                ) : pageRows.length === 0 ? (
                  <tr><td colSpan={8}><div className="admin-empty">No orders match your filters.</div></td></tr>
                ) : (
                  pageRows.map((o) => (
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

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14 }} data-admin-pagination>
              <div style={{ color: "var(--admin-muted)", fontSize: 12 }}>
                Page {page + 1} of {totalPages} · {filteredRows.length} orders
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="admin-btn admin-btn-ghost" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</button>
                <button className="admin-btn admin-btn-ghost" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <OrderDetailDrawer orderId={openId} onClose={() => setOpenId(null)} onChanged={() => void refresh()} />
    </AdminLayout>
  );
}
