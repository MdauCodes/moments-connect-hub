import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { Forbidden } from "@/components/admin/Forbidden";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_adminAuth/admin/staff")({
  component: AdminStaffPage,
});

function AdminStaffPage() {
  const { user } = useAdminAuth();
  if (!can(user?.role, "staff:manage")) {
    return (
      <AdminLayout title="Staff">
        <Forbidden resource="staff management" />
      </AdminLayout>
    );
  }
  return (
    <AdminLayout title="Staff" actionLabel="Invite staff">
      <ComingSoon label="Staff" />
    </AdminLayout>
  );
}
