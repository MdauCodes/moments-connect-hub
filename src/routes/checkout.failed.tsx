import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/checkout/failed")({
  component: () => <StubPage title="Payment failed" />,
});
