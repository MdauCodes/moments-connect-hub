// Legacy link-based reset route. Staff resets use the OTP flow at /admin/forgot-password.
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Moments Packaging" }, { name: "robots", content: "noindex" }] }),
  component: () => <Navigate to="/admin/forgot-password" replace />,
});
