import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Forbidden } from "@/components/admin/Forbidden";
import { useAuth } from "@/contexts/AdminAuthContext";
import type { BackendRole } from "@/services/adminApi";

export interface ProtectedRouteProps {
  requiredRole?: BackendRole;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isCheckingSession, ensureValidSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRequiredRole = !requiredRole || !!user?.roles.includes(requiredRole);

  const redirectToLogin = () => {
    const onLoginPage =
      location.pathname === "/login" ||
      location.pathname.startsWith("/admin/login");
    if (onLoginPage) return; // already at login — don't stack redirects
    void navigate({ to: "/login", search: { redirect: location.href }, replace: true });
  };

  useEffect(() => {
    if (isCheckingSession) return;

    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    void ensureValidSession().then((session) => {
      if (!session) redirectToLogin();
    });
  }, [ensureValidSession, isAuthenticated, isCheckingSession, location.href, location.pathname, navigate, user?.refreshToken]);

  if (isCheckingSession || !isAuthenticated) return null;
  if (!hasRequiredRole) return <Forbidden resource="this admin area" />;
  return <Outlet />;
}

export const AdminProtectedRoute = ProtectedRoute;
export default ProtectedRoute;
