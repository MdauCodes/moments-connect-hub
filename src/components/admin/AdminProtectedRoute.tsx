import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export function AdminProtectedRoute() {
  const { user, isAuthenticated, isCheckingSession, ensureValidSession } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectToLogin = () => {
    const redirect = location.pathname.startsWith("/admin/login") ? "/admin/enquiries" : location.href;
    void navigate({ to: "/admin/login", search: { redirect } });
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
  }, [ensureValidSession, isAuthenticated, isCheckingSession, location.href, location.pathname, navigate, user?.token]);

  if (isCheckingSession || !isAuthenticated) return null;
  return <Outlet />;
}

export default AdminProtectedRoute;
