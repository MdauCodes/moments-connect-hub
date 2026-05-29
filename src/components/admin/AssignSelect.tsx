import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { assignOrder, listAssignableUsers, type AssignableUser } from "@/services/commerceApi";
import { useAuth } from "@/contexts/AdminAuthContext";
import { canAssignTo, resolveStaffRole, STAFF_ROLE_DISPLAY, normalizeStaffRole } from "@/lib/roles";

interface Props {
  orderId: string;
  orderId: string;
  assignedTo?: string | null;
  assignedToId?: string | null;
  /** Payment status — only PAID orders can be assigned. */
  paymentStatus?: string | null;
  /** Order status — orders already dispatched/delivered/cancelled/refunded can't be (re)assigned. */
  orderStatus?: string | null;
  /** Compact = row variant (no helper label, fixed width). */
  compact?: boolean;
  onAssigned?: (patch: { assignedTo: string; assignedToId: string }) => void;
}

const TERMINAL_STATUSES = new Set(["DISPATCHED", "DELIVERED", "CANCELLED", "REFUNDED"]);

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

function roleLabel(name: string | undefined): string {
  const n = normalizeStaffRole(name);
  return n ? STAFF_ROLE_DISPLAY[n] : (name ?? "");
}

export function AssignSelect({ orderId, assignedTo, assignedToId, compact, onAssigned }: Props) {
  const { user } = useAuth();
  const currentRole = resolveStaffRole(user);
  const [assignees, setAssignees] = useState<AssignableUser[]>(cache ?? []);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void loadAssignees().then((rows) => { if (active) setAssignees(rows); });
    return () => { active = false; };
  }, []);

  // Hierarchy filter: only show users with rank >= current user's rank (equal or lower).
  const visible = useMemo(
    () => assignees.filter((u) => canAssignTo(currentRole, u.staffRoleName)),
    [assignees, currentRole],
  );

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const u = visible.find((a) => a.id === id);
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
          {assignedTo ? `Currently assigned to: ${assignedTo}` : "Not yet assigned"}
        </div>
      )}
      <select
        className="admin-select"
        value={assignedToId ?? ""}
        disabled={busy || visible.length === 0}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        title={assignedTo ? `Assigned to ${assignedTo}` : "Unassigned"}
        style={compact ? { fontSize: 12, padding: "4px 6px", maxWidth: 180 } : undefined}
      >
        <option value="" disabled>
          {assignedTo ? `→ ${assignedTo}` : visible.length === 0 ? "No staff available" : "Assign to…"}
        </option>
        {visible.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}{u.staffRoleName ? ` — ${roleLabel(u.staffRoleName)}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
