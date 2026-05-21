import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import { useAuth } from "@/contexts/AdminAuthContext";
import { PERM } from "@/lib/permissions";
import { listOrders, updateOrderStatus } from "@/services/commerceApi";
import { formatDateShort, formatKes } from "@/components/admin/commerceUi";
import type { OrderRecord } from "@/services/commerceMock";

export const Route = createFileRoute("/_adminAuth/admin/queues/payment")({
  component: PaymentQueuePage,
});

function PaymentQueuePage() {
  const { hasPermission } = useAuth();
  const allowed = hasPermission(PERM.ORDER_VERIFY_PAYMENT) || hasPermission(PERM.ORDER_MANAGE_ALL);
  const [rows, setRows] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listOrders({ status: "PAID", size: 100 });
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

  if (!allowed) return <AdminLayout title="Payment queue"><Forbidden resource="payment verification" /></AdminLayout>;

  const verify = async (o: OrderRecord) => {
    if (!confirm(`Confirm payment of ${formatKes(o.total)} is correct for order ${o.reference}?`)) return;
    setBusyId(o.id);
    // optimistic remove
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== o.id));
    try {
      await updateOrderStatus(o.id, "PAYMENT_VERIFIED");
      toast.success(`Payment verified for ${o.reference}`);
    } catch (err) {
      setRows(prev);
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout title="Payment queue" onReload={load}>
      <div className="admin-page-stack">
        <div className="admin-panel">
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
                {loading ? (
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
