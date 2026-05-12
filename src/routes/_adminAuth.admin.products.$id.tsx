import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import {
  ProductEditor,
  productToFormValues,
} from "@/components/admin/ProductEditor";
import { adminJson } from "@/services/adminApi";
import type { ProductDto } from "@/services/adminResources";
import { updateProductApi, deleteProductApi } from "@/services/adminProductApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_adminAuth/admin/products/$id")({
  loader: async ({ params }) => {
    const product = await adminJson<ProductDto>(
      `/api/v1/admin/products/${encodeURIComponent(params.id)}`
    );
    if (!product) throw notFound();
    return { product };
  },
  notFoundComponent: () => (
    <AdminLayout title="Product not found">
      <p style={{ color: "var(--admin-muted)", fontSize: 13 }}>This product no longer exists.</p>
    </AdminLayout>
  ),
  component: EditProductPage,
});

function EditProductPage() {
  const { product } = Route.useLoaderData();
  const navigate = useNavigate();
  const { user } = useAdminAuth();

  if (!can(user?.role, "product:edit")) {
    return (
      <AdminLayout title={`Edit: ${product.name}`}>
        <Forbidden resource="product editing" />
      </AdminLayout>
    );
  }

  const canDelete = can(user?.role, "product:delete");

  return (
    <AdminLayout title={`Edit: ${product.name}`}>
      <ProductEditor
        initial={productToFormValues(product)}
        submitLabel="Save changes"
        onCancel={() => navigate({ to: "/admin/products" })}
        onDelete={
          canDelete
            ? async () => {
                if (!confirm(`Delete "${product.name}" permanently?`)) return;
                await deleteProductApi(product.id);
                navigate({ to: "/admin/products" });
              }
            : undefined
        }
        onSubmit={async (values) => {
          await updateProductApi(product.id, values);
          navigate({ to: "/admin/products" });
        }}
      />
    </AdminLayout>
  );
}
