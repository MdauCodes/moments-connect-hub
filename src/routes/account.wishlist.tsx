import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/account/wishlist")({
  component: () => (
    <ProtectedRoute>
      <StubPage title="Wishlist" />
    </ProtectedRoute>
  ),
});
