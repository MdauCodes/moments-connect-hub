import { useEffect } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export function AdminProtectedRoute() {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  return <Outlet />;
}

export default AdminProtectedRoute;
