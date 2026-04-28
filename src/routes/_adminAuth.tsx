import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { getValidAdminSession } from "@/services/adminApi";

export const Route = createFileRoute("/_adminAuth")({
  beforeLoad: async ({ location }) => {
    const session = await getValidAdminSession();
    if (!session) {
      throw redirect({ to: "/admin/login", search: { redirect: location.href }, replace: true });
    }
  },
  component: AdminProtectedRoute,
});
