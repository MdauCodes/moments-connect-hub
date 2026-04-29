import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowUpRight, FileText, Inbox, Package, Plus, TrendingUp } from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { adminFetch } from "@/services/adminApi";
import { productStore } from "@/services/productStore";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/_adminAuth/admin/")({
  component: AdminDashboardPage,
});

type EnquiryStatus = "NEW" | "IN_PROGRESS" | "CLOSED";

interface EnquirySummary {
  id: string;
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  status: EnquiryStatus;
  createdAt: string;
  products: Array<{ name?: string; productName?: string; qty?: number; quantity?: number }>;
}

type EnquiryApiDto = Partial<EnquirySummary> & {
  id: string;
  contact?: { name?: string; email?: string; phone?: string; company?: string };
  items?: EnquirySummary["products"];
};

const styles: Record<string, CSSProperties> = {
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
    gap: 18,
    marginBottom: 18,
  },
  panel: {
    background: "var(--admin-surface)",
    border: "1px solid var(--admin-border)",
    borderRadius: 16,
    padding: 20,
    boxShadow: "var(--admin-shadow)",
  },
  eyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--admin-muted)",
    marginBottom: 8,
  },
  headline: {
    fontFamily: "var(--font-display)",
    fontSize: 30,
    lineHeight: 1.05,
    color: "var(--admin-text)",
    margin: 0,
  },
  copy: { fontSize: 13, color: "var(--admin-muted)", lineHeight: 1.6, maxWidth: 620, marginTop: 10 },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 18 },
  quickLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 12,
    background: "var(--admin-bg)",
    border: "1px solid var(--admin-border)",
    color: "var(--admin-text)",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 600,
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginBottom: 18 },
  statCard: {
    background: "var(--admin-surface)",
    border: "1px solid var(--admin-border)",
    borderRadius: 14,
    padding: 16,
    boxShadow: "var(--admin-shadow)",
  },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "color-mix(in oklab, var(--admin-accent) 16%, var(--admin-bg))",
    color: "var(--admin-accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 650, color: "var(--admin-text)", marginTop: 12 },
  statLabel: { fontSize: 11, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.08em" },
  lowerGrid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 0.78fr)", gap: 18 },
  list: { display: "flex", flexDirection: "column", gap: 10, marginTop: 14 },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid var(--admin-border)",
  },
  rowTitle: { fontSize: 13, fontWeight: 650, color: "var(--admin-text)" },
  rowMeta: { fontSize: 11.5, color: "var(--admin-muted)", marginTop: 3 },
  badge: {
    borderRadius: 999,
    padding: "4px 9px",
    fontSize: 10.5,
    fontWeight: 700,
    background: "color-mix(in oklab, var(--admin-kraft) 14%, var(--admin-bg))",
    color: "var(--admin-kraft)",
    whiteSpace: "nowrap",
  },
  empty: { color: "var(--admin-muted)", fontSize: 13, padding: "18px 0" },
};

function normalizeEnquiry(e: EnquiryApiDto): EnquirySummary {
  return {
    id: e.id,
    name: e.contact?.name ?? e.name ?? "Unknown customer",
    companyName: e.contact?.company ?? e.companyName,
    email: e.contact?.email ?? e.email,
    phone: e.contact?.phone ?? e.phone,
    status: e.status ?? "NEW",
    createdAt: e.createdAt ?? new Date().toISOString(),
    products: e.items ?? e.products ?? [],
  };
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<EnquirySummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const [enquiryRes, productRows] = await Promise.all([
          adminFetch("/api/v1/admin/enquiries?size=100"),
          productStore.list(),
        ]);
        const enquiryData = (await enquiryRes.json()) as { content?: EnquiryApiDto[] } | EnquiryApiDto[];
        if (!cancelled) {
          const rows = Array.isArray(enquiryData) ? enquiryData : enquiryData.content ?? [];
          setEnquiries(rows.map(normalizeEnquiry));
          setProducts(productRows);
        }
      } catch {
        if (!cancelled) {
          setEnquiries([]);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const dashboard = useMemo(() => {
    const activeEnquiries = enquiries.filter((e) => e.status !== "CLOSED").length;
    const newEnquiries = enquiries.filter((e) => e.status === "NEW").length;
    const monthlyClicks = products.reduce((sum, p) => sum + p.monthlyClicks, 0);
    const monthlyProductEnquiries = products.reduce((sum, p) => sum + p.monthlyEnquiries, 0);
    const recent = [...enquiries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    const topProducts = [...products].sort((a, b) => b.monthlyClicks - a.monthlyClicks).slice(0, 5);
    return { activeEnquiries, newEnquiries, monthlyClicks, monthlyProductEnquiries, recent, topProducts };
  }, [enquiries, products]);

  return (
    <AdminLayout title="Dashboard" actionLabel="New enquiry" onAction={() => navigate({ to: "/admin/enquiries/new" })}>
      <div style={styles.hero} data-admin-grid>
        <section style={styles.panel}>
          <div style={styles.eyebrow}>Operations command center</div>
          <h1 style={styles.headline}>Track enquiries, products, and content from one place.</h1>
          <p style={styles.copy}>
            Start with the highest-impact work: answer new enquiries, keep product listings clean, and publish packaging content that drives demand.
          </p>
          <div style={styles.quickGrid} data-admin-grid>
            <Link to="/admin/enquiries" style={styles.quickLink}>Review enquiries <ArrowUpRight size={15} /></Link>
            <Link to="/admin/products" style={styles.quickLink}>Manage products <ArrowUpRight size={15} /></Link>
            <Link to="/admin/blogs" style={styles.quickLink}>Manage blogs <ArrowUpRight size={15} /></Link>
            <Link to="/" style={styles.quickLink}>Open website <ArrowUpRight size={15} /></Link>
          </div>
        </section>
        <section style={styles.panel}>
          <div style={styles.eyebrow}>Today’s priority</div>
          <div style={styles.rowTitle}>{dashboard.newEnquiries} new enquiries need first response</div>
          <div style={styles.copy}>Keep quote requests moving before product updates and publishing work.</div>
          <div style={{ marginTop: 18 }}>
            <Link to="/admin/enquiries" style={{ ...styles.quickLink, background: "var(--admin-accent)", color: "var(--cream)" }}>
              Open enquiry queue <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
      </div>

      <div style={styles.statsGrid} data-admin-stats>
        <div style={styles.statCard}><div style={styles.statTop}><div style={styles.statLabel}>Active enquiries</div><div style={styles.statIcon}><Inbox size={17} /></div></div><div style={styles.statValue}>{loading ? "—" : dashboard.activeEnquiries}</div></div>
        <div style={styles.statCard}><div style={styles.statTop}><div style={styles.statLabel}>Products live</div><div style={styles.statIcon}><Package size={17} /></div></div><div style={styles.statValue}>{loading ? "—" : products.length}</div></div>
        <div style={styles.statCard}><div style={styles.statTop}><div style={styles.statLabel}>Monthly clicks</div><div style={styles.statIcon}><TrendingUp size={17} /></div></div><div style={styles.statValue}>{loading ? "—" : dashboard.monthlyClicks.toLocaleString()}</div></div>
        <div style={styles.statCard}><div style={styles.statTop}><div style={styles.statLabel}>Product enquiries</div><div style={styles.statIcon}><FileText size={17} /></div></div><div style={styles.statValue}>{loading ? "—" : dashboard.monthlyProductEnquiries}</div></div>
      </div>

      <div style={styles.lowerGrid} data-admin-grid>
        <section style={styles.panel}>
          <div style={styles.eyebrow}>Recent enquiries</div>
          <div style={styles.list}>
            {dashboard.recent.length === 0 ? <div style={styles.empty}>No recent enquiries found.</div> : dashboard.recent.map((e) => (
              <Link key={e.id} to="/admin/enquiries/$id" params={{ id: e.id }} style={{ ...styles.row, textDecoration: "none" }}>
                <div>
                  <div style={styles.rowTitle}>{e.companyName || e.name}</div>
                  <div style={styles.rowMeta}>{e.products[0]?.productName ?? e.products[0]?.name ?? "General enquiry"} · {formatRelativeDate(e.createdAt)}</div>
                </div>
                <span style={styles.badge}>{e.status.replace("_", " ")}</span>
              </Link>
            ))}
          </div>
        </section>
        <section style={styles.panel}>
          <div style={styles.eyebrow}>Top product activity</div>
          <div style={styles.list}>
            {dashboard.topProducts.length === 0 ? <div style={styles.empty}>No product activity yet.</div> : dashboard.topProducts.map((p) => (
              <Link key={p.id} to="/admin/products/$id" params={{ id: p.id }} style={{ ...styles.row, textDecoration: "none" }}>
                <div>
                  <div style={styles.rowTitle}>{p.name}</div>
                  <div style={styles.rowMeta}>{p.monthlyEnquiries} enquiries this month</div>
                </div>
                <span style={styles.badge}>{p.monthlyClicks.toLocaleString()} clicks</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
