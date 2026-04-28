import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import { ProductEditor, emptyProductValues } from "@/components/admin/ProductEditor";
import { productStore } from "@/services/productStore";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_adminAuth/admin/products/new")({
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const { user, isCheckingSession } = useAdminAuth();

  if (isCheckingSession) return <div>Loading...</div>;

  if (!can(user?.role, "product:create")) {
    return (
      <AdminLayout title="New product">
        <Forbidden resource="product creation" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="New product">
      <ProductEditor
        initial={emptyProductValues()}
        submitLabel="Create product"
        onCancel={() => navigate({ to: "/admin/products" })}
        onSubmit={async (values) => {
          await productStore.create(values);
          navigate({ to: "/admin/products" });
        }}
      />
    </AdminLayout>
  );
}
