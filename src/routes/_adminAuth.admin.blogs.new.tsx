import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { BlogEditor, emptyFormValues } from "@/components/admin/BlogEditor";
import { blogStore } from "@/services/blogStore";

export const Route = createFileRoute("/_adminAuth/admin/blogs/new")({
  component: NewBlogPage,
});

function NewBlogPage() {
  const navigate = useNavigate();
  return (
    <AdminLayout title="New blog">
      <BlogEditor
        initial={emptyFormValues()}
        submitLabel="Publish"
        onCancel={() => navigate({ to: "/admin/blogs" })}
        onSubmit={async (values) => {
          await blogStore.create({
            ...values,
            publishedAt: values.status === "published" ? new Date().toISOString() : null,
          });
          navigate({ to: "/admin/blogs" });
        }}
      />
    </AdminLayout>
  );
}
