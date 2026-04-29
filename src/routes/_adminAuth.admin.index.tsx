import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_adminAuth/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/enquiries" });
  },
});
