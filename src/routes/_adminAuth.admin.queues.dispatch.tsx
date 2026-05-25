import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import { useAuth } from "@/contexts/AdminAuthContext";
import { useAdminOrders } from "@/contexts/AdminOrdersContext";
import { PERM } from "@/lib/permissions";
import { formatDateShort } from "@/components/admin/commerceUi";
import { DispatchChecklist } from "@/components/admin/DispatchChecklist";
import { QueueFreshness } from "@/components/admin/QueueFreshness";
import { HelpPanel, HelpAnchor } from "@/components/admin/HelpPanel";
import type { OrderRecord } from "@/services/commerceMock";

export const Route = createFileRoute("/_adminAuth/admin/queues/dispatch")({
  component: DispatchQueuePage,
});

function DispatchQueuePage() {
  const { hasPermission } = useAuth();
  const allowed = hasPermission(PERM.ORDER_DISPATCH) || hasPermission(PERM.ORDER_MANAGE_ALL);
  const { orders, initialLoading, refresh } = useAdminOrders();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const rows = useMemo(
    () => orders.filter((o) => o.status === "READY_FOR_DISPATCH"),
    [orders],
  );

  const openOrder: OrderRecord | null = useMemo(
    () => (openOrderId ? rows.find((o) => o.id === openOrderId) ?? null : null),
    [openOrderId, rows],
  );

  const handleClose = useCallback(() => setOpenOrderId(null), []);
  const handleDispatched = useCallback(
    async () => {
      setOpenOrderId(null);
      await refresh();
    },
    [refresh],
  );

  if (!allowed) return <AdminLayout title="Dispatch queue"><Forbidden resource="dispatch" /></AdminLayout>;

  return (
    <AdminLayout title="Dispatch queue" onReload={() => void refresh()}>
      <div className="admin-page-stack">
        <HelpAnchor>
          <div className="admin-panel">
            <HelpPanel title="Dispatch queue">
              <p>These orders are produced and ready to hand off. Click <b>Open Checklist</b>, tick what you've packed and confirm. For <b>Own Courier</b> orders, share the courier name and tracking number with the customer; for <b>Pickup</b>, call them before they come.</p>
            </HelpPanel>
            <QueueFreshness />
          <div data-admin-table-scroll>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>County</th>
                  <th>Fulfillment</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {initialLoading ? (
                  <tr><td colSpan={7}><div className="admin-empty">Loading…</div></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7}><div className="admin-empty">No orders ready for dispatch</div></td></tr>
                ) : rows.map((o) => (
                  <tr key={o.id}>
                    <td><b>{o.reference}</b></td>
                    <td>{o.customerName}</td>
                    <td>{o.customerPhone}</td>
                    <td>{o.county ?? "—"}</td>
                    <td>
                      {o.fulfillmentType ?? "—"}
                      {o.fulfillmentType === "OWN_COURIER" && o.courierType && (
                        <div style={{ fontSize: 11, color: "var(--admin-muted)" }}>{o.courierType}</div>
                      )}
                    </td>
                    <td>{formatDateShort(o.createdAt)}</td>
                    <td>
                      <button className="admin-btn admin-btn-primary" onClick={() => setOpenOrderId(o.id)}>
                        Open Checklist
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </HelpAnchor>
      </div>
      <DispatchChecklist order={openOrder} onClose={handleClose} onDispatched={handleDispatched} />
    </AdminLayout>
  );
}
