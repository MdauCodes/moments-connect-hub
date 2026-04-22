import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/_adminAuth/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  return (
    <AdminLayout title="Settings">
      <ComingSoon label="Settings" />
    </AdminLayout>
  );
}
