import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/_adminAuth/admin/staff")({
  component: AdminStaffPage,
});

function AdminStaffPage() {
  return (
    <AdminLayout title="Staff" actionLabel="Invite staff">
      <ComingSoon label="Staff" />
    </AdminLayout>
  );
}
