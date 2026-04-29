import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Inbox } from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { adminFetch } from "@/services/adminApi";

export const Route = createFileRoute("/_adminAuth/admin/enquiries")({
  component: AdminEnquiriesPage,
});

type EnquiryStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "CLOSED";

type CustomerType = "SME" | "CORPORATE";

interface EnquiryProduct {
  productId: string;
  name: string;
  qty: number;
  size?: string;
  finish?: string;
}

interface Enquiry {
  id: string;
  customerType: CustomerType;
  name: string;
  companyName?: string;
  email?: string;
  phone: string;
  products: EnquiryProduct[];
  status: EnquiryStatus;
  createdAt: string;
  isRead: boolean;
}

type FilterKey =
  | "ALL"
  | "NEW"
  | "IN_PROGRESS"
  | "CLOSED"
  | "SME"
  | "CORPORATE";

const PAGE_SIZE = 15;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "CLOSED", label: "Closed" },
  { key: "SME", label: "SME only" },
  { key: "CORPORATE", label: "Corporate only" },
];

const STATUS_STYLES: Record<
  EnquiryStatus,
  { bg: string; color: string; border: string; dot: string; label: string }
> = {
  NEW: { bg: "color-mix(in oklab, var(--admin-clay) 24%, var(--admin-surface))", color: "var(--admin-clay)", border: "var(--admin-clay)", dot: "var(--admin-clay)", label: "New" },
  IN_PROGRESS: { bg: "color-mix(in oklab, var(--admin-kraft) 18%, var(--admin-surface))", color: "var(--admin-kraft)", border: "var(--admin-kraft)", dot: "var(--admin-kraft)", label: "In progress" },
  CLOSED: { bg: "color-mix(in oklab, var(--admin-accent) 34%, var(--admin-surface))", color: "var(--cream)", border: "var(--admin-accent)", dot: "var(--cream)", label: "Closed" },
};

const styles: Record<string, CSSProperties> = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 22,
  },
  statCard: {
    background: "linear-gradient(180deg, color-mix(in oklab, var(--admin-surface) 88%, var(--cream) 12%), var(--admin-surface))",
    border: "1px solid var(--admin-border)",
    borderRadius: 14,
    padding: "16px 18px",
    boxShadow: "var(--admin-shadow)",
  },
  statCardHighlight: {
    background: "color-mix(in oklab, var(--admin-accent) 24%, var(--admin-bg))",
    border: "1px solid var(--admin-accent)",
    borderRadius: 14,
    padding: "16px 18px",
    boxShadow: "var(--admin-shadow)",
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--admin-muted)",
  },
  statValue: {
    fontSize: 30,
    fontWeight: 700,
    color: "var(--admin-text)",
    marginTop: 6,
    lineHeight: 1.1,
  },
  statDelta: { fontSize: 11, marginTop: 4 },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    background: "var(--admin-border)",
    border: "1px solid var(--admin-border)",
    color: "var(--admin-muted)",
    borderRadius: 7,
    padding: "5px 12px",
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  filterBtnActive: {
    background: "color-mix(in oklab, var(--admin-accent) 34%, var(--admin-surface))",
    border: "1px solid var(--admin-accent)",
    color: "var(--admin-accent-hover)",
    borderRadius: 7,
    padding: "5px 12px",
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  exportBtn: {
    marginLeft: "auto",
    background: "transparent",
    border: "1px solid var(--admin-border)",
    color: "var(--admin-muted)",
    borderRadius: 7,
    padding: "5px 12px",
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  tableWrap: {
    background: "linear-gradient(180deg, color-mix(in oklab, var(--admin-surface) 90%, var(--cream) 10%), var(--admin-surface))",
    border: "1px solid var(--admin-border)",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "var(--admin-shadow)",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "32px 1.6fr 0.8fr 1.4fr 0.9fr 1fr 80px",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    borderBottom: "1px solid var(--admin-border)",
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--admin-muted)",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "32px 1.6fr 0.8fr 1.4fr 0.9fr 1fr 80px",
    alignItems: "center",
    gap: 12,
    padding: "11px 16px",
    borderBottom: "1px solid var(--admin-border)",
    cursor: "pointer",
    transition: "background 120ms",
  },
  checkbox: {
    width: 14,
    height: 14,
    border: "1px solid var(--admin-border)",
    background: "var(--admin-bg)",
    borderRadius: 3,
    display: "block",
  },
  customerPrimary: { fontSize: 13, fontWeight: 500, color: "var(--admin-text)", lineHeight: 1.3 },
  customerSecondary: { fontSize: 11, color: "var(--admin-muted)", marginTop: 2 },
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 100,
    fontSize: 10,
    fontWeight: 600,
    padding: "3px 9px",
  },
  productMain: { fontSize: 11.5, color: "var(--admin-muted)", lineHeight: 1.3 },
  productMore: { fontSize: 10.5, color: "var(--admin-muted)", marginTop: 2 },
  dateMain: { fontSize: 11, color: "var(--admin-muted)", lineHeight: 1.3 },
  dateSub: { fontSize: 10.5, color: "var(--admin-muted)", marginTop: 2 },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    borderRadius: 100,
    padding: "3px 9px",
    fontSize: 10.5,
    fontWeight: 500,
    width: "fit-content",
  },
  statusDot: { width: 5, height: 5, borderRadius: "50%", display: "inline-block" },
  viewBtn: {
    background: "var(--admin-border)",
    border: "1px solid var(--admin-border)",
    color: "var(--admin-muted)",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    gap: 8,
  },
  emptyText: { fontSize: 14, color: "var(--admin-muted)" },
  emptySub: { fontSize: 12, color: "var(--admin-border)" },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  paginationInfo: { fontSize: 11, color: "var(--admin-muted)" },
  paginationControls: { display: "flex", gap: 6 },
  pageBtn: {
    width: 28,
    height: 28,
    background: "var(--admin-border)",
    border: "1px solid var(--admin-border)",
    color: "var(--admin-muted)",
    borderRadius: 6,
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtnActive: {
    width: 28,
    height: 28,
    background: "var(--admin-accent)",
    border: "1px solid var(--admin-accent)",
    color: "var(--cream)",
    borderRadius: 6,
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  skeletonRow: {
    display: "grid",
    gridTemplateColumns: "32px 1.6fr 0.8fr 1.4fr 0.9fr 1fr 80px",
    alignItems: "center",
    gap: 12,
    padding: "11px 16px",
    borderBottom: "1px solid var(--admin-border)",
  },
  skeletonBlock: {
    height: 14,
    background: "var(--admin-border)",
    borderRadius: 4,
    animation: "adminPulse 1.4s ease-in-out infinite",
  },
  errorWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    gap: 12,
  },
  errorText: { fontSize: 13, color: "var(--admin-clay)" },
  retryBtn: {
    background: "var(--admin-accent)",
    color: "var(--cream)",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function renderDate(iso: string): { main: string; sub: string } {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, now)) return { main: "Today", sub: formatTime(d) };
  if (isSameDay(d, yesterday)) return { main: "Yesterday", sub: formatTime(d) };
  return { main: formatShortDate(d), sub: formatTime(d) };
}

function toCsv(rows: Enquiry[]): string {
  const headers = [
    "id",
    "customerType",
    "name",
    "companyName",
    "email",
    "phone",
    "status",
    "createdAt",
    "isRead",
    "products",
  ];
  const escape = (v: string): string => `"${v.replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const r of rows) {
    const products = r.products
      .map((p) => `${p.name} x${p.qty}`)
      .join("; ");
    lines.push(
      [
        r.id,
        r.customerType,
        r.name,
        r.companyName ?? "",
        r.email ?? "",
        r.phone,
        r.status,
        r.createdAt,
        String(r.isRead),
        products,
      ]
        .map((v) => escape(String(v)))
        .join(","),
    );
  }
  return lines.join("\n");
}

function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

type EnquiryApiItem = {
  productId?: string;
  productName?: string;
  name?: string;
  quantity?: number;
  qty?: number;
  size?: string;
  finish?: string;
};

type EnquiryApiDto = Partial<Omit<Enquiry, "products" | "name" | "phone" | "customerType">> & {
  id: string;
  persona?: string;
  contact?: { name?: string; email?: string; phone?: string; company?: string };
  companyName?: string;
  phone?: string;
  products?: EnquiryApiItem[];
  items?: EnquiryApiItem[];
};

function normalizeEnquiry(e: EnquiryApiDto): Enquiry {
  const items = e.items ?? e.products ?? [];
  return {
    id: e.id,
    customerType: e.persona === "CORPORATE" ? "CORPORATE" : "SME",
    name: e.contact?.name ?? "Unknown customer",
    companyName: e.contact?.company ?? e.companyName,
    email: e.contact?.email ?? e.email,
    phone: e.contact?.phone ?? e.phone ?? "",
    products: items.map((item) => ({
      productId: item.productId ?? item.name ?? item.productName ?? "",
      name: item.productName ?? item.name ?? "Product",
      qty: item.quantity ?? item.qty ?? 1,
      size: item.size,
      finish: item.finish,
    })),
    status: e.status ?? "NEW",
    createdAt: e.createdAt ?? new Date().toISOString(),
    isRead: e.isRead ?? true,
  };
}

function AdminEnquiriesPage() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminFetch("/api/v1/admin/enquiries?size=100");
        if (!res.ok) {
          throw new Error(`Failed to load enquiries (${res.status})`);
        }
        const data = (await res.json()) as { content?: EnquiryApiDto[] } | EnquiryApiDto[];
        if (!cancelled) {
          const rows = Array.isArray(data) ? data : data.content ?? [];
          setEnquiries(rows.map(normalizeEnquiry));
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load enquiries";
          setError(message);
          setEnquiries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      switch (filter) {
        case "ALL":
          return true;
        case "SME":
          return e.customerType === "SME";
        case "CORPORATE":
          return e.customerType === "CORPORATE";
        case "NEW":
        case "IN_PROGRESS":
        case "CLOSED":
          return e.status === filter;
        default:
          return true;
      }
    });
  }, [enquiries, filter]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const stats = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    let newToday = 0;
    let newYesterday = 0;
    let pending = 0;
    let overdue = 0;
    let confirmedThisMonth = 0;
    const dayMs = 24 * 60 * 60 * 1000;

    for (const e of enquiries) {
      const created = new Date(e.createdAt);
      if (e.status === "NEW" && isSameDay(created, now)) newToday++;
      if (e.status === "NEW" && isSameDay(created, yesterday)) newYesterday++;
      if (e.status === "NEW" || e.status === "IN_PROGRESS") {
        pending++;
        if (now.getTime() - created.getTime() > dayMs) overdue++;
      }
      if (e.status === "CLOSED" && isSameMonth(created, now)) confirmedThisMonth++;
    }

    return { newToday, newYesterday, pending, overdue, confirmedThisMonth };
  }, [enquiries]);

  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = filteredEnquiries.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(safePage * PAGE_SIZE, filteredEnquiries.length);
  const pageRows = filteredEnquiries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleExport = () => {
    const csv = toCsv(filteredEnquiries);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`enquiries-${stamp}.csv`, csv);
  };

  const handleRowClick = (id: string) => {
    void navigate({ to: "/admin/enquiries/$id", params: { id } });
  };

  return (
    <AdminLayout
      title="Enquiries"
      actionLabel="+ New enquiry"
      onAction={() => navigate({ to: "/admin/enquiries/new" })}
    >
      <style>{`@keyframes adminPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }`}</style>

      {/* Stat cards */}
      <div style={styles.statsGrid} data-admin-stats>
        <div style={styles.statCardHighlight}>
          <div style={styles.statLabel}>New today</div>
          <div style={{ ...styles.statValue, color: "var(--admin-accent-hover)" }}>{stats.newToday}</div>
          <div style={{ ...styles.statDelta, color: "var(--admin-accent-hover)" }}>
            +{stats.newYesterday} from yesterday
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pending quote</div>
          <div style={styles.statValue}>{stats.pending}</div>
          {stats.overdue > 0 && (
            <div style={{ ...styles.statDelta, color: "var(--admin-clay)" }}>
              {stats.overdue} overdue &gt;24h
            </div>
          )}
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Confirmed this month</div>
          <div style={styles.statValue}>{stats.confirmedThisMonth}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Avg. response time</div>
          <div style={{ ...styles.statValue, color: "var(--admin-muted)" }}>—</div>
        </div>
      </div>

      {/* Filter row */}
      <div style={styles.filterRow} data-admin-toolbar>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            style={filter === f.key ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        <button type="button" style={styles.exportBtn} onClick={handleExport}>
          ↓ Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={styles.tableWrap} data-admin-table-scroll>
        <div style={styles.tableHeader} data-admin-enquiry-head>
          <div data-admin-enquiry-check />
          <div>Customer</div>
          <div>Type</div>
          <div>Products</div>
          <div>Date</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {loading && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ ...styles.skeletonRow, ...(i === 3 ? { borderBottom: "none" } : {}) }} data-admin-enquiry-skeleton>
                <div style={{ ...styles.skeletonBlock, width: 14, height: 14, borderRadius: 3 }} data-admin-enquiry-check />
                <div>
                  <div style={{ ...styles.skeletonBlock, width: "70%" }} />
                  <div style={{ ...styles.skeletonBlock, width: "45%", marginTop: 6, height: 10 }} />
                </div>
                <div style={{ ...styles.skeletonBlock, width: 60, height: 16, borderRadius: 100 }} />
                <div style={{ ...styles.skeletonBlock, width: "80%" }} />
                <div style={{ ...styles.skeletonBlock, width: "60%" }} />
                <div style={{ ...styles.skeletonBlock, width: 80, height: 16, borderRadius: 100 }} />
                <div style={{ ...styles.skeletonBlock, width: 60, height: 22, borderRadius: 6 }} />
              </div>
            ))}
          </>
        )}

        {!loading && error && (
          <div style={styles.errorWrap}>
            <div style={styles.errorText}>{error}</div>
            <button type="button" style={styles.retryBtn} onClick={() => setReloadKey((k) => k + 1)}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && pageRows.length === 0 && (
          <div style={styles.empty}>
            <Inbox size={32} color="var(--admin-border)" />
            <div style={styles.emptyText}>No enquiries found</div>
            <div style={styles.emptySub}>Try adjusting your filters</div>
          </div>
        )}

        {!loading && !error && pageRows.map((e, idx) => {
          const date = renderDate(e.createdAt);
          const status = STATUS_STYLES[e.status];
          const typeBadgeStyle: CSSProperties =
            e.customerType === "SME"
              ? {
                  ...styles.typeBadge,
                  background: "color-mix(in oklab, var(--admin-kraft) 18%, var(--admin-surface))",
                  color: "var(--admin-kraft)",
                  border: "1px solid var(--admin-kraft)",
                }
              : {
                  ...styles.typeBadge,
                  background: "color-mix(in oklab, var(--admin-accent) 34%, var(--admin-surface))",
                  color: "var(--cream)",
                  border: "1px solid var(--admin-accent)",
                };
          const isLast = idx === pageRows.length - 1;
          const rowStyle: CSSProperties = {
            ...styles.row,
            ...(isLast ? { borderBottom: "none" } : {}),
            ...(!e.isRead
              ? { borderLeft: "3px solid var(--admin-accent-hover)", paddingLeft: 13 }
              : {}),
          };
          const firstProduct = e.products[0];
          const moreCount = Math.max(0, e.products.length - 1);

          return (
            <div
              key={e.id}
              style={rowStyle}
              data-admin-enquiry-row
              onClick={() => handleRowClick(e.id)}
              onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--admin-surface-2)")}
              onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
            >
              <div onClick={(ev) => ev.stopPropagation()} data-admin-enquiry-check>
                <span style={styles.checkbox} />
              </div>
              <div>
                <div style={styles.customerPrimary}>{e.companyName || e.name}</div>
                <div style={styles.customerSecondary}>{e.phone || e.email}</div>
              </div>
              <div>
                <span style={typeBadgeStyle}>{e.customerType}</span>
              </div>
              <div>
                {firstProduct ? (
                  <>
                    <div style={styles.productMain}>
                      {firstProduct.name} × {firstProduct.qty}
                    </div>
                    {moreCount > 0 && (
                      <div style={styles.productMore}>+ {moreCount} more</div>
                    )}
                  </>
                ) : (
                  <div style={styles.productMain}>—</div>
                )}
              </div>
              <div>
                <div style={styles.dateMain}>{date.main}</div>
                <div style={styles.dateSub}>{date.sub}</div>
              </div>
              <div>
                <span
                  style={{
                    ...styles.statusBadge,
                    background: status.bg,
                    color: status.color,
                    border: `1px solid ${status.border}`,
                  }}
                >
                  <span style={{ ...styles.statusDot, background: status.dot }} />
                  {status.label}
                </span>
              </div>
              <div onClick={(ev) => ev.stopPropagation()} data-admin-enquiry-action>
                <button
                  type="button"
                  style={styles.viewBtn}
                  onClick={() => handleRowClick(e.id)}
                  onMouseEnter={(ev) => {
                    ev.currentTarget.style.background = "var(--admin-accent)";
                    ev.currentTarget.style.borderColor = "var(--admin-accent)";
                    ev.currentTarget.style.color = "var(--cream)";
                  }}
                  onMouseLeave={(ev) => {
                    ev.currentTarget.style.background = "var(--admin-border)";
                    ev.currentTarget.style.borderColor = "var(--admin-border)";
                    ev.currentTarget.style.color = "var(--admin-muted)";
                  }}
                >
                  View →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {!loading && !error && filteredEnquiries.length > 0 && (
        <div style={styles.pagination} data-admin-pagination>
          <div style={styles.paginationInfo}>
            Showing {start}–{end} of {filteredEnquiries.length} enquiries
          </div>
          <div style={styles.paginationControls}>
            <button
              type="button"
              style={styles.pageBtn}
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  style={pageNum === safePage ? styles.pageBtnActive : styles.pageBtn}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              style={styles.pageBtn}
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
