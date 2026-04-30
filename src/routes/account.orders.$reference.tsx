import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/account/orders/$reference")({
  component: function OrderDetail() {
    const { reference } = Route.useParams();
    return (
      <ProtectedRoute>
        <StubPage title={`Order ${reference}`} description="Order details coming soon." />
      </ProtectedRoute>
    );
  },
});
