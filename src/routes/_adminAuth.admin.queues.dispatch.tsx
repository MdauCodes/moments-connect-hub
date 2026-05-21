import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import { useAuth } from "@/contexts/AdminAuthContext";
import { PERM } from "@/lib/permissions";
import { listOrders } from "@/services/commerceApi";
import { formatDateShort } from "@/components/admin/commerceUi";
import { DispatchChecklist } from "@/components/admin/DispatchChecklist";
import type { OrderRecord } from "@/services/commerceMock";

export const Route = createFileRoute("/_adminAuth/admin/queues/dispatch")({
  component: DispatchQueuePage,
});

function DispatchQueuePage() {
  const { hasPermission } = useAuth();
  const allowed = hasPermission(PERM.ORDER_DISPATCH) || hasPermission(PERM.ORDER_MANAGE_ALL);
  const [rows, setRows] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openOrder, setOpenOrder] = useState<OrderRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOrders({ status: "READY_FOR_DISPATCH", size: 100 });
      setRows(res.rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    void load();
    const t = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(t);
  }, [allowed, load]);

  if (!allowed) return <AdminLayout title="Dispatch queue"><Forbidden resource="dispatch" /></AdminLayout>;

  const handleDispatched = (id: string) => {
    setRows((r) => r.filter((o) => o.id !== id));
    setOpenOrder(null);
  };

  return (
    <AdminLayout title="Dispatch queue" onReload={load}>
      <div className="admin-page-stack">
        <div className="admin-panel">
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
                {loading ? (
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
                      <button className="admin-btn admin-btn-primary" onClick={() => setOpenOrder(o)}>
                        Open Checklist
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DispatchChecklist order={openOrder} onClose={() => setOpenOrder(null)} onDispatched={handleDispatched} />
    </AdminLayout>
  );
}
