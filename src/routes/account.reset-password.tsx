// Legacy link-based reset route. The backend now uses a 6-digit OTP flow,
// handled inline at /account/forgot-password. Redirect there.
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/account/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Moments Packaging" }, { name: "robots", content: "noindex" }] }),
  component: () => <Navigate to="/account/forgot-password" replace />,
});
