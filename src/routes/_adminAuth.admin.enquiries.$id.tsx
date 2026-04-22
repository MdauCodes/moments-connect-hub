import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/_adminAuth/admin/enquiries/$id")({
  component: AdminEnquiryDetailPage,
});

function AdminEnquiryDetailPage() {
  const { id } = Route.useParams();
  return (
    <AdminLayout title={`Enquiry ${id}`}>
      <ComingSoon label={`Enquiry ${id}`} />
    </AdminLayout>
  );
}
