import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export function AdminProtectedRoute() {
  const { user, isAuthenticated, isCheckingSession, ensureValidSession } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isCheckingSession) return;

    if (!isAuthenticated) {
      void navigate({ to: "/admin/login", search: { redirect: location.href } });
      return;
    }

    void ensureValidSession().then((session) => {
      if (!session) void navigate({ to: "/admin/login", search: { redirect: location.href } });
    });
  }, [ensureValidSession, isAuthenticated, isCheckingSession, location.href, navigate, user?.token]);

  if (isCheckingSession || !isAuthenticated) return null;
  return <Outlet />;
}

export default AdminProtectedRoute;
