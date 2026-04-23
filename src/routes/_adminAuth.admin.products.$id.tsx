import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import {
  ProductEditor,
  productToFormValues,
} from "@/components/admin/ProductEditor";
import { productStore } from "@/services/productStore";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_adminAuth/admin/products/$id")({
  loader: async ({ params }) => {
    const product = await productStore.getById(params.id);
    if (!product) throw notFound();
    return { product };
  },
  notFoundComponent: () => (
    <AdminLayout title="Product not found">
      <p style={{ color: "#8896A8", fontSize: 13 }}>This product no longer exists.</p>
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
                await productStore.remove(product.id);
                navigate({ to: "/admin/products" });
              }
            : undefined
        }
        onSubmit={async (values) => {
          await productStore.update(product.id, values);
          navigate({ to: "/admin/products" });
        }}
      />
    </AdminLayout>
  );
}
