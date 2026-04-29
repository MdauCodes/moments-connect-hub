import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { adminJson } from "@/services/adminApi";
import { adminResources, type EnquiryDto, type ProductDto } from "@/services/adminResources";

export const Route = createFileRoute("/_adminAuth/admin/")({ component: AdminDashboardPage });

export function AdminDashboardPage() {
  const [products, setProducts] = useState<ProductDto[]>([]); const [enquiries, setEnquiries] = useState<EnquiryDto[]>([]); const [leads, setLeads] = useState<unknown[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { let cancelled = false; const run = async () => { setLoading(true); try { const [p, e, l] = await Promise.all([adminResources.products.list({ size: 100 }), adminResources.enquiries.list({ size: 100 }), adminJson<unknown[]>("/api/v1/admin/leads").catch(() => [])]); if (!cancelled) { setProducts(p.rows); setEnquiries(e.rows); setLeads(Array.isArray(l) ? l : []); } } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to load dashboard"); } finally { if (!cancelled) setLoading(false); } }; void run(); return () => { cancelled = true; }; }, []);
  const recent = useMemo(() => [...enquiries].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()).slice(0, 5), [enquiries]);
  const stats = [{ label: "Total products", value: products.length }, { label: "Total enquiries", value: enquiries.length }, { label: "New enquiries", value: enquiries.filter((e) => e.status === "NEW").length }, { label: "Total leads", value: leads.length }];
  return <AdminLayout title="Dashboard"><div className="admin-page-stack"><div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }} data-admin-stats>{stats.map((s) => <div key={s.label} className="admin-panel" style={{ padding: 16 }}><div className="admin-label">{s.label}</div><div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--admin-text)", marginTop: 8 }}>{loading ? "—" : s.value}</div></div>)}</div><div className="admin-panel" data-admin-table-scroll><div className="admin-toolbar"><h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Recent enquiries</h2><Link to="/admin/enquiries" className="admin-btn admin-btn-ghost">View all</Link></div><table className="admin-table"><thead><tr><th>Reference</th><th>Contact</th><th>Status</th><th>Created</th></tr></thead><tbody>{loading ? <tr><td colSpan={4}>Loading recent enquiries…</td></tr> : recent.length === 0 ? <tr><td colSpan={4}><div className="admin-empty">No enquiries yet.</div></td></tr> : recent.map((e) => <tr key={e.id}><td><b>{e.referenceNumber ?? e.reference ?? `ENQ-${e.id}`}</b></td><td>{e.contact?.name ?? e.name ?? "Unknown"}</td><td><span className="admin-badge admin-badge-muted">{e.status}</span></td><td>{e.createdAt ? new Date(e.createdAt).toLocaleDateString("en-KE") : "—"}</td></tr>)}</tbody></table></div></div></AdminLayout>;
}
