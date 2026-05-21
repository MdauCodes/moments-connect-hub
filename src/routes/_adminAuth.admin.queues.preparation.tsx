import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import { useAuth } from "@/contexts/AdminAuthContext";
import { useAdminOrders } from "@/contexts/AdminOrdersContext";
import { PERM } from "@/lib/permissions";
import { updateOrderStatus } from "@/services/commerceApi";
import { formatDateShort, OrderStatusBadge } from "@/components/admin/commerceUi";
import { QueueFreshness } from "@/components/admin/QueueFreshness";
import type { OrderRecord, OrderStatus } from "@/services/commerceMock";

export const Route = createFileRoute("/_adminAuth/admin/queues/preparation")({
  component: PreparationQueuePage,
});

function PreparationQueuePage() {
  const { hasPermission } = useAuth();
  const allowed = hasPermission(PERM.ORDER_PREPARE) || hasPermission(PERM.ORDER_MANAGE_ALL);
  const { orders, initialLoading, refresh } = useAdminOrders();
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      orders
        .filter((o) => o.status === "PAYMENT_VERIFIED" || o.status === "IN_PRODUCTION")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  );

  if (!allowed) return <AdminLayout title="Preparation queue"><Forbidden resource="order preparation" /></AdminLayout>;

  const advance = async (o: OrderRecord, next: OrderStatus, label: string) => {
    setBusyId(o.id);
    try {
      await updateOrderStatus(o.id, next);
      toast.success(`${label}: ${o.reference}`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout title="Preparation queue" onReload={() => void refresh()}>
      <div className="admin-page-stack">
        <div className="admin-panel">
          <QueueFreshness />
          <div data-admin-table-scroll>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>County</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {initialLoading ? (
                  <tr><td colSpan={7}><div className="admin-empty">Loading…</div></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7}><div className="admin-empty">No orders in preparation</div></td></tr>
                ) : rows.map((o) => (
                  <tr key={o.id}>
                    <td><b>{o.reference}</b></td>
                    <td>{o.customerName}</td>
                    <td style={{ maxWidth: 340 }}>{o.items.map((i) => i.name).join(", ")}</td>
                    <td>{o.county ?? "—"}</td>
                    <td><OrderStatusBadge status={o.status} /></td>
                    <td>{formatDateShort(o.createdAt)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {o.status === "PAYMENT_VERIFIED" && (
                        <button
                          className="admin-btn admin-btn-primary"
                          disabled={busyId === o.id}
                          onClick={() => void advance(o, "IN_PRODUCTION", "Started production")}
                        >
                          Start Production
                        </button>
                      )}
                      {o.status === "IN_PRODUCTION" && (
                        <button
                          className="admin-btn admin-btn-primary"
                          disabled={busyId === o.id}
                          onClick={() => void advance(o, "READY_FOR_DISPATCH", "Marked ready")}
                        >
                          Mark Ready
                        </button>
                      )}
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
