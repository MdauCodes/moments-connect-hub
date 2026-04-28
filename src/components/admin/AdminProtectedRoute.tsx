import { useEffect } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export function AdminProtectedRoute() {
  const { user, isAuthenticated, isCheckingSession, ensureValidSession } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCheckingSession) return;

    if (!isAuthenticated) {
      void navigate({ to: "/admin/login" });
      return;
    }

    void ensureValidSession().then((session) => {
      if (!session) void navigate({ to: "/admin/login" });
    });
  }, [ensureValidSession, isAuthenticated, isCheckingSession, navigate, user?.token]);

  if (isCheckingSession || !isAuthenticated) return null;
  return <Outlet />;
}

export default AdminProtectedRoute;
