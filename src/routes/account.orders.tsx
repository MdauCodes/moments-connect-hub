import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/account/orders")({
  component: () => (
    <ProtectedRoute>
      <StubPage title="My orders" />
    </ProtectedRoute>
  ),
});
