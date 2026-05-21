import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import { useAuth } from "@/contexts/AdminAuthContext";
import { PERM } from "@/lib/permissions";
import { listOrders, updateOrderStatus } from "@/services/commerceApi";
import { formatDateShort, OrderStatusBadge } from "@/components/admin/commerceUi";
import type { OrderRecord, OrderStatus } from "@/services/commerceMock";

export const Route = createFileRoute("/_adminAuth/admin/queues/preparation")({
  component: PreparationQueuePage,
});

function PreparationQueuePage() {
  const { hasPermission } = useAuth();
  const allowed = hasPermission(PERM.ORDER_PREPARE) || hasPermission(PERM.ORDER_MANAGE_ALL);
  const [rows, setRows] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [verified, inProd] = await Promise.all([
        listOrders({ status: "PAYMENT_VERIFIED", size: 100 }),
        listOrders({ status: "IN_PRODUCTION", size: 100 }),
      ]);
      const merged = [...verified.rows, ...inProd.rows].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRows(merged);
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

  if (!allowed) return <AdminLayout title="Preparation queue"><Forbidden resource="order preparation" /></AdminLayout>;

  const advance = async (o: OrderRecord, next: OrderStatus, label: string) => {
    setBusyId(o.id);
    try {
      await updateOrderStatus(o.id, next);
      toast.success(`${label}: ${o.reference}`);
      if (next === "READY_FOR_DISPATCH") {
        setRows((r) => r.filter((x) => x.id !== o.id));
      } else {
        setRows((r) => r.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout title="Preparation queue" onReload={load}>
      <div className="admin-page-stack">
        <div className="admin-panel">
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
                {loading ? (
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
