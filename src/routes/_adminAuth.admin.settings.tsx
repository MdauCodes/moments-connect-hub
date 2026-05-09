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
  return <AdminLayout title="Settings"><div className="admin-page-stack"><MaintenanceToggleCard /><div className="admin-panel" data-admin-table-scroll><table className="admin-table"><thead><tr><th>Key</th><th>Value</th><th>Description</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan={4}>Loading settings…</td></tr> : rows.length === 0 ? <tr><td colSpan={4}><div className="admin-empty">No settings found.</div></td></tr> : rows.map((r) => <tr key={r.key}><td><b>{r.key}</b></td><td><input className="admin-input" value={drafts[r.key]?.value ?? ""} onChange={(e) => setDrafts({ ...drafts, [r.key]: { ...drafts[r.key], key: r.key, value: e.target.value } })} /></td><td><input className="admin-input" value={drafts[r.key]?.description ?? ""} onChange={(e) => setDrafts({ ...drafts, [r.key]: { ...drafts[r.key], key: r.key, description: e.target.value } })} /></td><td><button className="admin-btn admin-btn-primary" disabled={savingKey === r.key} onClick={() => void save(r.key)}>{savingKey === r.key && <Loader2 size={14} className="animate-spin" />}Save</button></td></tr>)}</tbody></table></div></div></AdminLayout>;
}

function MaintenanceToggleCard() {
  const [override, setOverrideState] = useState<"on" | "off" | "backend">(() => {
    if (typeof window === "undefined") return "backend";
    const v = localStorage.getItem("moments_maintenance_override");
    return v === "on" ? "on" : v === "off" ? "off" : "backend";
  });

  const apply = (next: "on" | "off" | "backend") => {
    if (next === "backend") localStorage.removeItem("moments_maintenance_override");
    else localStorage.setItem("moments_maintenance_override", next);
    setOverrideState(next);
    toast.success(`Maintenance mode set to: ${next === "backend" ? "follow backend setting" : next.toUpperCase()}. Reloading…`);
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="admin-panel" style={{ padding: 20, marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Maintenance / "Coming soon" overlay</h2>
      <p style={{ margin: "6px 0 14px", fontSize: 13, color: "#666" }}>
        Toggle the green "Under development" overlay shown to visitors. The override below is saved to this browser
        and beats the backend setting. Use <code>?maintenance=on</code>, <code>?maintenance=off</code>, or <code>?maintenance=clear</code>
        in the URL on any device to flip it remotely.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className={`admin-btn ${override === "on" ? "admin-btn-primary" : ""}`} onClick={() => apply("on")}>
          Show overlay (ON)
        </button>
        <button className={`admin-btn ${override === "off" ? "admin-btn-primary" : ""}`} onClick={() => apply("off")}>
          Hide overlay — show live site (OFF)
        </button>
        <button className={`admin-btn ${override === "backend" ? "admin-btn-primary" : ""}`} onClick={() => apply("backend")}>
          Follow backend setting
        </button>
      </div>
      <p style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
        For a permanent global toggle, add a setting with key <code>maintenanceMode</code> and value <code>true</code>/<code>false</code> in the table below.
      </p>
    </div>
  );
}
