import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/_adminAuth/admin/enquiries")({
  component: AdminEnquiriesPage,
});

function AdminEnquiriesPage() {
  return (
    <AdminLayout title="Enquiries" actionLabel="New enquiry">
      <ComingSoon label="Enquiries" />
    </AdminLayout>
  );
}
