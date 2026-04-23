import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { Forbidden } from "@/components/admin/Forbidden";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_adminAuth/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { user } = useAdminAuth();
  if (!can(user?.role, "settings:manage")) {
    return (
      <AdminLayout title="Settings">
        <Forbidden resource="workspace settings" />
      </AdminLayout>
    );
  }
  return (
    <AdminLayout title="Settings">
      <ComingSoon label="Settings" />
    </AdminLayout>
  );
}
