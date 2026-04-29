import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import { useAuth } from "@/contexts/AdminAuthContext";
import { adminResources, type SettingDto } from "@/services/adminResources";

export const Route = createFileRoute("/_adminAuth/admin/settings")({ component: AdminSettingsPage });
function AdminSettingsPage() {
  const { isAdmin } = useAuth(); const [rows, setRows] = useState<SettingDto[]>([]); const [drafts, setDrafts] = useState<Record<string, SettingDto>>({}); const [loading, setLoading] = useState(true); const [savingKey, setSavingKey] = useState<string | null>(null);
  const load = async () => { setLoading(true); try { const data = await adminResources.settings.list(); setRows(data); setDrafts(Object.fromEntries(data.map((s) => [s.key, s]))); } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to load settings"); } finally { setLoading(false); } };
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);
  if (!isAdmin) return <AdminLayout title="Settings"><Forbidden resource="settings" /></AdminLayout>;
  const save = async (key: string) => { setSavingKey(key); try { await adminResources.settings.upsert(drafts[key]); toast.success("Setting saved"); await load(); } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); } finally { setSavingKey(null); } };
  return <AdminLayout title="Settings"><div className="admin-page-stack"><div className="admin-panel" data-admin-table-scroll><table className="admin-table"><thead><tr><th>Key</th><th>Value</th><th>Description</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan={4}>Loading settings…</td></tr> : rows.length === 0 ? <tr><td colSpan={4}><div className="admin-empty">No settings found.</div></td></tr> : rows.map((r) => <tr key={r.key}><td><b>{r.key}</b></td><td><input className="admin-input" value={drafts[r.key]?.value ?? ""} onChange={(e) => setDrafts({ ...drafts, [r.key]: { ...drafts[r.key], key: r.key, value: e.target.value } })} /></td><td><input className="admin-input" value={drafts[r.key]?.description ?? ""} onChange={(e) => setDrafts({ ...drafts, [r.key]: { ...drafts[r.key], key: r.key, description: e.target.value } })} /></td><td><button className="admin-btn admin-btn-primary" disabled={savingKey === r.key} onClick={() => void save(r.key)}>{savingKey === r.key && <Loader2 size={14} className="animate-spin" />}Save</button></td></tr>)}</tbody></table></div></div></AdminLayout>;
}
