import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { defaultLandingFor, hasAnyPerm, type PermissionCode } from "@/lib/permissions";

/**
 * Redirects the user to their permission-derived landing page if they lack
 * any of the required permissions. Returns `true` once allowed, `false`
 * while the redirect is pending so callers can render `null`.
 *
 * Intended for page-level guards — never use it for in-component conditional
 * rendering (use hasPermission directly for that).
 */
export function useRequirePermission(required: PermissionCode | PermissionCode[]): boolean {
  const { permissions, user, isCheckingSession } = useAdminAuth();
  const navigate = useNavigate();
  const needed = Array.isArray(required) ? required : [required];
  const allowed = hasAnyPerm(permissions, needed);

  useEffect(() => {
    if (isCheckingSession) return;
    if (!user) return; // AdminProtectedRoute will redirect to /login
    if (allowed) return;
    const landing = defaultLandingFor(permissions, user.staffRole ?? user.role);
    void navigate({ to: landing, replace: true });
  }, [allowed, isCheckingSession, user, permissions, navigate]);

  return allowed;
}
