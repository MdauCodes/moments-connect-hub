import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { blogStore } from "@/services/blogStore";
import type { Blog } from "@/data/blogs";
import { TEMPLATE_META } from "@/data/blogs";

export const Route = createFileRoute("/_adminAuth/admin/blogs")({
  component: AdminBlogsPage,
});

const badgeStyle = (tone: "ok" | "muted"): CSSProperties => ({
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 10.5,
  fontWeight: 600,
  background: tone === "ok" ? "color-mix(in oklab, var(--admin-accent) 34%, var(--admin-surface))" : "var(--admin-border)",
  color: tone === "ok" ? "var(--cream)" : "var(--admin-muted)",
});

const styles: Record<string, CSSProperties> = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  search: {
    background: "color-mix(in oklab, var(--admin-bg) 84%, var(--admin-surface) 16%)",
    border: "1px solid var(--admin-border)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 13,
    color: "var(--admin-text)",
    width: 260,
    outline: "none",
    fontFamily: "inherit",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "var(--admin-surface)",
    border: "1px solid var(--admin-border)",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "var(--admin-shadow)",
  },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "var(--admin-muted)",
    background: "var(--admin-bg)",
    borderBottom: "1px solid var(--admin-border)",
  },
  td: {
    padding: "12px 14px",
    fontSize: 12.5,
    color: "var(--admin-text)",
    borderBottom: "1px solid var(--admin-border)",
  },
  link: { color: "var(--cream)", textDecoration: "none", fontWeight: 500 },
  emptyState: {
    background: "linear-gradient(180deg, color-mix(in oklab, var(--admin-surface) 88%, var(--cream) 12%), var(--admin-surface))",
    border: "1px dashed var(--admin-border)",
    borderRadius: 14,
    padding: 40,
    textAlign: "center",
    color: "var(--admin-muted)",
    fontSize: 14,
    boxShadow: "var(--admin-shadow)",
  },
};

function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  async function refresh() {
    const all = await blogStore.list();
    setBlogs(all);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = (blogs ?? []).filter(
    (b) =>
      !q ||
      b.title.toLowerCase().includes(q.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <AdminLayout
      title="Blogs"
      actionLabel="New blog"
      onAction={() => navigate({ to: "/admin/blogs/new" })}
    >
      <div style={styles.toolbar} data-admin-toolbar>
        <input
          style={styles.search}
          data-admin-search-input
          placeholder="Search by title or tag…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span style={{ fontSize: 11.5, color: "var(--admin-muted)" }}>
          {blogs ? `${blogs.length} total` : "Loading…"}
        </span>
      </div>

      {blogs === null ? (
        <div style={styles.emptyState}>Loading blogs…</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          {q ? "No blogs match that search." : "No blogs yet — click 'New blog' to create one."}
        </div>
      ) : (
        <div data-admin-table-scroll>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Template</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Updated</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 500, color: "var(--admin-text)" }}>{b.title}</div>
                  <div style={{ fontSize: 11, color: "var(--admin-muted)", marginTop: 2 }}>/{b.slug}</div>
                </td>
                <td style={styles.td}>{TEMPLATE_META[b.template].label}</td>
                <td style={styles.td}>
                  <span style={badgeStyle(b.status === "published" ? "ok" : "muted")}>
                    {b.status}
                  </span>
                </td>
                <td style={styles.td}>{new Date(b.updatedAt).toLocaleDateString("en-KE")}</td>
                <td style={styles.td}>
                  <Link to="/admin/blogs/$id" params={{ id: b.id }} style={styles.link}>
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </AdminLayout>
  );
}
