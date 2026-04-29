import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "./_adminAuth.admin.index";

export const Route = createFileRoute("/_adminAuth/admin/dashboard")({
  component: AdminDashboardPage,
});
