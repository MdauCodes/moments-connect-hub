import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/staff")({
  component: () => (
    <ProtectedRoute>
      <StubPage title="Staff order management" />
    </ProtectedRoute>
  ),
});
