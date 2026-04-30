import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/checkout")({
  component: () => (
    <ProtectedRoute>
      <StubPage title="Checkout" description="Secure checkout coming soon." />
    </ProtectedRoute>
  ),
});
