import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import {
  GatewayChip,
  MockBanner,
  ORDER_STATUS_OPTIONS,
  OrderStatusBadge,
  PaymentStatusBadge,
  formatDate,
  formatKes,
} from "@/components/admin/commerceUi";
import { getOrder, updateOrderStatus } from "@/services/commerceApi";
import type { OrderRecord, OrderStatus } from "@/services/commerceMock";

export const Route = createFileRoute("/_adminAuth/admin/orders/$id")({
  component: AdminOrderDetailPage,
});

function AdminOrderDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderRecord | undefined>();
  const [source, setSource] = useState<"live" | "mock">("mock");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = `Order ${id} · Moments admin`; }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrder(id)
      .then((res) => { if (!cancelled) { setOrder(res.order); setSource(res.source); } })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load order"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await updateOrderStatus(order.id, status);
      if (res.order) {
        setOrder(res.order);
        toast.success(`Order moved to ${status}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLayout title={`Order ${id}`}><div className="admin-empty">Loading order…</div></AdminLayout>;
  }
  if (!order) {
    return (
      <AdminLayout title="Order not found">
        <div className="admin-panel" style={{ padding: 24 }}>
          <p>We couldn't find that order.</p>
          <button className="admin-btn admin-btn-ghost" onClick={() => navigate({ to: "/admin/orders" })}>Back to orders</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Order ${order.reference}`}>
      <div className="admin-page-stack">
        <MockBanner source={source} />

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link to="/admin/orders" className="admin-btn admin-btn-ghost">← All orders</Link>
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
          <GatewayChip gateway={order.paymentGateway} />
          <span style={{ color: "var(--admin-muted)", fontSize: 12 }}>Created {formatDate(order.createdAt)}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }} data-admin-grid>
          {/* Left: line items */}
          <div className="admin-panel" style={{ padding: 18 }}>
            <h2 style={{ margin: 0, marginBottom: 12, fontFamily: "var(--font-display)" }}>Line items</h2>
            <div data-admin-table-scroll>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.productId}>
                      <td><b>{it.name}</b><div style={{ color: "var(--admin-muted)", fontSize: 11 }}>{it.productId}</div></td>
                      <td>{it.qty}</td>
                      <td>{formatKes(it.unitPrice)}</td>
                      <td><b>{formatKes(it.qty * it.unitPrice)}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "grid", gap: 6, marginTop: 16, justifyContent: "end", textAlign: "right" }}>
              <div style={{ color: "var(--admin-muted)", fontSize: 12 }}>Subtotal: {formatKes(order.subtotal)}</div>
              <div style={{ color: "var(--admin-muted)", fontSize: 12 }}>Shipping: {order.shippingFee === 0 ? "Free" : formatKes(order.shippingFee)}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>Total: {formatKes(order.total)}</div>
            </div>
          </div>

          {/* Right: customer + actions */}
          <div className="admin-page-stack">
            <div className="admin-panel" style={{ padding: 16 }}>
              <div className="admin-label">Customer</div>
              <div style={{ marginTop: 8, fontWeight: 600 }}>{order.customerName}</div>
              <div style={{ fontSize: 13 }}>{order.customerEmail}</div>
              <div style={{ fontSize: 13 }}>{order.customerPhone}</div>
              <div style={{ marginTop: 10 }} className="admin-label">Shipping</div>
              <div style={{ marginTop: 6, fontSize: 13 }}>{order.shippingAddress}</div>
              <div style={{ fontSize: 13 }}>{order.city}</div>
              {order.trackingNumber && (
                <>
                  <div style={{ marginTop: 10 }} className="admin-label">Tracking</div>
                  <div style={{ marginTop: 6, fontSize: 13, fontFamily: "monospace" }}>{order.trackingNumber}</div>
                </>
              )}
            </div>

            <div className="admin-panel" style={{ padding: 16 }}>
              <div className="admin-label">Update status</div>
              <select
                className="admin-select"
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                disabled={saving}
                style={{ marginTop: 8 }}
              >
                {ORDER_STATUS_OPTIONS.filter((o) => o.value !== "ALL").map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button className="admin-btn admin-btn-ghost" disabled={saving} onClick={() => handleStatusChange("PROCESSING")}>Mark processing</button>
                <button className="admin-btn admin-btn-ghost" disabled={saving} onClick={() => handleStatusChange("SHIPPED")}>Mark shipped</button>
                <button className="admin-btn admin-btn-danger" disabled={saving} onClick={() => handleStatusChange("REFUNDED")}>Refund</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
