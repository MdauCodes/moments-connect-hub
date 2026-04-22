import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/_adminAuth/admin/products")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  return (
    <AdminLayout title="Products" actionLabel="Add product">
      <ComingSoon label="Products" />
    </AdminLayout>
  );
}
