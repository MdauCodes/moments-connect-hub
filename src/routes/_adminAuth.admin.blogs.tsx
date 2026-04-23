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
  background: tone === "ok" ? "#1E3A2A" : "#1E2535",
  color: tone === "ok" ? "#9AE6B4" : "#8896A8",
});

const styles: Record<string, CSSProperties> = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  search: {
    background: "#0F1117",
    border: "1px solid #1E2535",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    color: "#E2E8F0",
    width: 260,
    outline: "none",
    fontFamily: "inherit",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#161B27",
    border: "1px solid #1E2535",
    borderRadius: 10,
    overflow: "hidden",
  },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#4A5568",
    background: "#0F1117",
    borderBottom: "1px solid #1E2535",
  },
  td: {
    padding: "12px 14px",
    fontSize: 12.5,
    color: "#CBD5E0",
    borderBottom: "1px solid #1E2535",
  },
  link: { color: "#9AE6B4", textDecoration: "none", fontWeight: 500 },
  emptyState: {
    background: "#161B27",
    border: "1px dashed #1E2535",
    borderRadius: 10,
    padding: 40,
    textAlign: "center",
    color: "#4A5568",
    fontSize: 13,
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
      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="Search by title or tag…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span style={{ fontSize: 11.5, color: "#4A5568" }}>
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
                  <div style={{ fontWeight: 500, color: "#E2E8F0" }}>{b.title}</div>
                  <div style={{ fontSize: 11, color: "#4A5568", marginTop: 2 }}>/{b.slug}</div>
                </td>
                <td style={styles.td}>{TEMPLATE_META[b.template].label}</td>
                <td style={styles.td}>
                  <span style={styles.badge(b.status === "published" ? "ok" : "muted")}>
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
      )}
    </AdminLayout>
  );
}
