import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Boxes, Gift, Percent, Ticket } from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MockBanner, formatKes } from "@/components/admin/commerceUi";
import { getDashboardStats, type DashboardResult } from "@/services/commerceApi";
import { useAuth } from "@/contexts/AdminAuthContext";
import { useAdminOrders } from "@/contexts/AdminOrdersContext";
import { resolveStaffRole } from "@/lib/roles";
import { HelpPanel, HelpAnchor } from "@/components/admin/HelpPanel";

const upcomingModules = [
  { icon: Boxes, label: "Stock & Inventory", desc: "Live stock levels, low-stock alerts, batch & variant tracking." },
  { icon: Gift, label: "Referrals", desc: "Customer referral codes, rewards wallet & redemption flow." },
  { icon: Percent, label: "Commissions", desc: "Sales rep & partner commission tracking and payouts." },
  { icon: Ticket, label: "Coupons & Promos", desc: "Discount codes, campaign rules and usage analytics." },
];

export const Route = createFileRoute("/_adminAuth/admin/")({ component: AdminDashboardPage });

type ApiStats = DashboardResult & {
  revenueMTD?: number;
  topSellingProducts?: string[];
};

export function AdminDashboardPage() {
  const { user } = useAuth();
  const staffRole = resolveStaffRole(user);
  const navigate = useNavigate();

  // STAFF redirects straight to their orders.
  useEffect(() => {
    if (staffRole === "STAFF") {
      void navigate({ to: "/admin/orders", replace: true });
    }
  }, [staffRole, navigate]);

  // Specialist roles see a simplified, queue-focused dashboard.
  if (staffRole === "PAYMENTS_CONFIRMER") return <SpecialistDashboard role="PAYMENTS_CONFIRMER" />;
  if (staffRole === "PREPARER") return <SpecialistDashboard role="PREPARER" />;
  if (staffRole === "DISPATCHER") return <SpecialistDashboard role="DISPATCHER" />;
  if (staffRole === "SUPERVISOR") return <FullDashboard variant="supervisor" />;

  // Default = admin / super admin
  return <FullDashboard variant="admin" />;
}

// ─────────────────────────── full dashboard (admin / supervisor) ────────────

function FullDashboard({ variant }: { variant: "admin" | "supervisor" }) {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Dashboard · Moments admin"; }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboardStats()
      .then((res) => { if (!cancelled) setStats(res as ApiStats); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const tiles = stats ? [
    typeof stats.revenueToday === "number" && {
      label: "Revenue today",
      value: formatKes(stats.revenueToday),
      sub: "",
    },
    typeof stats.ordersToday === "number" && {
      label: "Orders today",
      value: String(stats.ordersToday),
      sub: typeof stats.ordersPending === "number" ? `${stats.ordersPending} pending` : "",
    },
    typeof stats.revenueMTD === "number" && {
      label: "Revenue MTD",
      value: formatKes(stats.revenueMTD),
      sub: "Month to date",
    },
  ].filter(Boolean) as { label: string; value: string; sub: string }[] : [];

  const topProducts = stats?.topSellingProducts ?? [];

  return (
    <AdminLayout title="Dashboard">
      <HelpAnchor>
        <HelpPanel title={variant === "supervisor" ? "Supervisor dashboard" : "Admin dashboard"}>
          {variant === "supervisor" ? (
            <div>
              <p style={{ marginTop: 0 }}>
                As <b>Supervisor</b> you can monitor live performance and route orders to the right team.
              </p>
              <ul style={{ paddingLeft: 18, margin: "6px 0" }}>
                <li>Review revenue and order activity</li>
                <li>Open <Link to="/admin/orders">Orders</Link> to assign and oversee fulfillment</li>
                <li>Use <Link to="/admin/analytics">Analytics</Link> for deeper trends</li>
              </ul>
              <p style={{ marginBottom: 0, fontSize: 12 }}>
                You can assign orders only to staff at your level or below — not to Admins or Super Admins.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ marginTop: 0 }}>
                You have full system access. From here you can monitor revenue, manage staff
                accounts and roles, and configure system settings.
              </p>
              <div style={{ fontWeight: 600, marginTop: 6, color: "var(--admin-text)" }}>Staff roles</div>
              <ul style={{ paddingLeft: 18, margin: "4px 0" }}>
                <li><b>Admin</b>: Full access except role management</li>
                <li><b>Supervisor</b>: Views all orders, assigns staff, analytics</li>
                <li><b>Payments Confirmer</b>: Verifies M-Pesa payments</li>
                <li><b>Preparer</b>: Packages orders for dispatch</li>
                <li><b>Dispatcher</b>: Dispatches packaged orders</li>
                <li><b>Staff</b>: Works on orders assigned to them</li>
              </ul>
            </div>
          )}
        </HelpPanel>

        <div className="admin-page-stack">
          {stats && <MockBanner source={stats.source} />}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }} data-admin-stats>
            {(loading
              ? Array.from({ length: 3 }).map((_, i) => ({ label: "Loading…", value: "—", sub: "" }))
              : tiles
            ).map((t, i) => (
              <div key={i} className="admin-panel" style={{ padding: 16 }}>
                <div className="admin-label">{t.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 30, marginTop: 8, lineHeight: 1.1 }}>{t.value}</div>
                {t.sub && <div style={{ fontSize: 11, marginTop: 6, color: "var(--admin-muted)" }}>{t.sub}</div>}
              </div>
            ))}
          </div>

          <div className="admin-panel" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Top products (30d)</h2>
              {variant === "admin" && <Link to="/admin/products" className="admin-btn admin-btn-ghost">All products</Link>}
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {topProducts.map((name, idx) => (
                <div key={`${name}-${idx}`} style={{ display: "flex", gap: 8, alignItems: "center", padding: 10, border: "1px solid var(--admin-border)", borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{idx + 1}. {name}</div>
                </div>
              ))}
              {!loading && topProducts.length === 0 && <div className="admin-empty" style={{ padding: 16 }}>No sales data yet.</div>}
            </div>
          </div>

          {variant === "admin" && (
            <div className="admin-panel" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, gap: 12, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Coming soon</h2>
                <span style={{ fontSize: 11, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Roadmap · Q3</span>
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--admin-muted)" }}>
                Modules currently in design — they'll appear in the sidebar once shipped.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {upcomingModules.map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    style={{ position: "relative", padding: 14, border: "1px dashed var(--admin-border)", borderRadius: 10, background: "var(--admin-surface-2, transparent)" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--admin-accent)", color: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={14} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-text)" }}>{label}</div>
                      <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 999, background: "var(--admin-clay)", color: "var(--cream)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Soon</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--admin-muted)", lineHeight: 1.45 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </HelpAnchor>
    </AdminLayout>
  );
}

// ─────────────────────────── specialist single-stage dashboard ──────────────

function SpecialistDashboard({ role }: { role: "PAYMENTS_CONFIRMER" | "PREPARER" | "DISPATCHER" }) {
  const { orders, initialLoading, refresh } = useAdminOrders();

  useEffect(() => { document.title = "Dashboard · Moments admin"; }, []);

  const counts = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isToday = (iso: string) => new Date(iso).getTime() >= today.getTime();
    return {
      paid: orders.filter((o) => o.status === "PAID").length,
      verifiedToday: orders.filter((o) => o.status !== "PAID" && o.status !== "PENDING_PAYMENT" && isToday(o.updatedAt)).length,
      paymentVerified: orders.filter((o) => o.status === "PAYMENT_VERIFIED").length,
      inProduction: orders.filter((o) => o.status === "IN_PRODUCTION").length,
      readyForDispatch: orders.filter((o) => o.status === "READY_FOR_DISPATCH").length,
      dispatchedToday: orders.filter((o) => o.status === "DISPATCHED" && isToday(o.updatedAt)).length,
    };
  }, [orders]);

  const config = role === "PAYMENTS_CONFIRMER"
    ? {
        title: "Payments Confirmer",
        tiles: [
          { label: "Awaiting verification", value: counts.paid, sub: "Orders marked PAID" },
          { label: "Verified today", value: counts.verifiedToday, sub: "Moved out of PAID today" },
        ],
        link: { to: "/admin/queues/payment", label: "Open Payment Queue" },
        help: "Your job is to verify that M-Pesa payments have been received before orders move to production. Only orders with status PAID appear in the queue. If you see a suspicious payment, contact your supervisor.",
      }
    : role === "PREPARER"
    ? {
        title: "Preparer",
        tiles: [
          { label: "Awaiting production", value: counts.paymentVerified, sub: "Payment verified" },
          { label: "In production", value: counts.inProduction, sub: "Being packed" },
        ],
        link: { to: "/admin/queues/preparation", label: "Open Preparation Queue" },
        help: "Pack orders and mark them ready for dispatch. Click Start Packing when you begin, then Mark Ready when fully packed.",
      }
    : {
        title: "Dispatcher",
        tiles: [
          { label: "Ready for dispatch", value: counts.readyForDispatch, sub: "Waiting to ship" },
          { label: "Dispatched today", value: counts.dispatchedToday, sub: "Sent to courier today" },
        ],
        link: { to: "/admin/queues/dispatch", label: "Open Dispatch Queue" },
        help: "Verify order contents and dispatch them to the customer. Open the checklist, confirm all items, and click Dispatch Order.",
      };

  return (
    <AdminLayout title={`${config.title} dashboard`} onReload={() => void refresh()}>
      <HelpAnchor>
        <HelpPanel title={`Your role: ${config.title}`}>
          <p style={{ margin: 0 }}>{config.help}</p>
        </HelpPanel>

        <div className="admin-page-stack">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {config.tiles.map((t, i) => (
              <div key={i} className="admin-panel" style={{ padding: 18 }}>
                <div className="admin-label">{t.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 36, marginTop: 8, lineHeight: 1.1 }}>
                  {initialLoading ? "—" : t.value}
                </div>
                <div style={{ fontSize: 11, marginTop: 6, color: "var(--admin-muted)" }}>{t.sub}</div>
              </div>
            ))}
          </div>
          <div className="admin-panel" style={{ padding: 18, textAlign: "center" }}>
            <Link to={config.link.to} className="admin-btn admin-btn-primary" style={{ display: "inline-block", padding: "10px 20px" }}>
              {config.link.label} →
            </Link>
          </div>
        </div>
      </HelpAnchor>
    </AdminLayout>
  );
}
