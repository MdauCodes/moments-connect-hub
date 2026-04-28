import { createFileRoute } from "@tanstack/react-router";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";

export const Route = createFileRoute("/_adminAuth")({
  component: AdminProtectedRoute,
});
