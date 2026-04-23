import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { BlogEditor, blogToFormValues } from "@/components/admin/BlogEditor";
import { blogStore } from "@/services/blogStore";

export const Route = createFileRoute("/_adminAuth/admin/blogs/$id")({
  loader: async ({ params }) => {
    const blog = await blogStore.getById(params.id);
    if (!blog) throw notFound();
    return { blog };
  },
  notFoundComponent: () => (
    <AdminLayout title="Blog not found">
      <p style={{ color: "#8896A8", fontSize: 13 }}>This blog no longer exists.</p>
    </AdminLayout>
  ),
  component: EditBlogPage,
});

function EditBlogPage() {
  const { blog } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <AdminLayout title={`Edit: ${blog.title}`}>
      <BlogEditor
        initial={blogToFormValues(blog)}
        submitLabel="Save & publish"
        onCancel={() => navigate({ to: "/admin/blogs" })}
        onDelete={async () => {
          if (!confirm("Delete this blog permanently?")) return;
          await blogStore.remove(blog.id);
          navigate({ to: "/admin/blogs" });
        }}
        onSubmit={async (values) => {
          await blogStore.update(blog.id, values);
          navigate({ to: "/admin/blogs" });
        }}
      />
    </AdminLayout>
  );
}
