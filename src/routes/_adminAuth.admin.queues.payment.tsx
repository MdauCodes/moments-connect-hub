import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import { useAuth } from "@/contexts/AdminAuthContext";
import { useAdminOrders } from "@/contexts/AdminOrdersContext";
import { PERM } from "@/lib/permissions";
import { updateOrderStatus } from "@/services/commerceApi";
import { formatDateShort, formatKes } from "@/components/admin/commerceUi";
import { QueueFreshness } from "@/components/admin/QueueFreshness";
import type { OrderRecord } from "@/services/commerceMock";

export const Route = createFileRoute("/_adminAuth/admin/queues/payment")({
  component: PaymentQueuePage,
});

function PaymentQueuePage() {
  const { hasPermission } = useAuth();
  const allowed = hasPermission(PERM.ORDER_VERIFY_PAYMENT) || hasPermission(PERM.ORDER_MANAGE_ALL);
  const { orders, initialLoading, refresh } = useAdminOrders();
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(
    () => orders.filter((o) => o.status === "PAID"),
    [orders],
  );

  if (!allowed) return <AdminLayout title="Payment queue"><Forbidden resource="payment verification" /></AdminLayout>;

  const verify = async (o: OrderRecord) => {
    if (!confirm(`Confirm payment of ${formatKes(o.total)} is correct for order ${o.reference}?`)) return;
    setBusyId(o.id);
    try {
      await updateOrderStatus(o.id, "PAYMENT_VERIFIED");
      toast.success(`Payment verified for ${o.reference}`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout title="Payment queue" onReload={() => void refresh()}>
      <div className="admin-page-stack">
        <div className="admin-panel">
          <QueueFreshness />
          <div data-admin-table-scroll>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total (KES)</th>
                  <th>Items</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {initialLoading ? (
                  <tr><td colSpan={7}><div className="admin-empty">Loading…</div></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7}><div className="admin-empty">No orders awaiting payment verification</div></td></tr>
                ) : rows.map((o) => (
                  <tr key={o.id}>
                    <td><b>{o.reference}</b></td>
                    <td>{o.customerName}</td>
                    <td>{o.customerPhone}</td>
                    <td><b>{formatKes(o.total)}</b></td>
                    <td>{o.items.reduce((s, i) => s + Number(i.qty ?? 0), 0)} units</td>
                    <td>{formatDateShort(o.createdAt)}</td>
                    <td>
                      <button
                        className="admin-btn admin-btn-primary"
                        disabled={busyId === o.id}
                        onClick={() => void verify(o)}
                      >
                        Verify Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
