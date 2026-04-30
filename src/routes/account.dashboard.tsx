import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/account/dashboard")({
  component: () => (
    <ProtectedRoute>
      <StubPage title="Account dashboard" />
    </ProtectedRoute>
  ),
});
