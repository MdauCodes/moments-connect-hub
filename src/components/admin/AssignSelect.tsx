import { useEffect, useState } from "react";
import { toast } from "sonner";
import { assignOrder, listAssignableUsers, type AssignableUser } from "@/services/commerceApi";

interface Props {
  orderId: string;
  assignedTo?: string | null;
  assignedToId?: string | null;
  /** Compact = row variant (no helper label, fixed width). */
  compact?: boolean;
  onAssigned?: (patch: { assignedTo: string; assignedToId: string }) => void;
}

// Module-level cache so we don't refetch on every row render.
let cache: AssignableUser[] | null = null;
let pending: Promise<AssignableUser[]> | null = null;
function loadAssignees(): Promise<AssignableUser[]> {
  if (cache) return Promise.resolve(cache);
  if (pending) return pending;
  pending = listAssignableUsers()
    .then((rows) => { cache = rows; return rows; })
    .finally(() => { pending = null; });
  return pending;
}

export function AssignSelect({ orderId, assignedTo, assignedToId, compact, onAssigned }: Props) {
  const [assignees, setAssignees] = useState<AssignableUser[]>(cache ?? []);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void loadAssignees().then((rows) => { if (active) setAssignees(rows); });
    return () => { active = false; };
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const u = assignees.find((a) => a.id === id);
    if (!u) return;
    setBusy(true);
    try {
      await assignOrder(orderId, u.name, u.id);
      toast.success(`Assigned to ${u.name}`);
      onAssigned?.({ assignedTo: u.name, assignedToId: u.id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: compact ? "row" : "column", gap: 4, alignItems: compact ? "center" : "stretch", minWidth: 0 }}>
      {!compact && (
        <div style={{ fontSize: 11, color: "var(--admin-muted)" }}>
          {assignedTo ? `Assigned to: ${assignedTo}` : "Unassigned"}
        </div>
      )}
      <select
        className="admin-select"
        value={assignedToId ?? ""}
        disabled={busy}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        title={assignedTo ? `Assigned to ${assignedTo}` : "Unassigned"}
        style={compact ? { fontSize: 12, padding: "4px 6px", maxWidth: 160 } : undefined}
      >
        <option value="" disabled>
          {assignedTo ? `→ ${assignedTo}` : "Assign to…"}
        </option>
        {assignees.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </div>
  );
}
