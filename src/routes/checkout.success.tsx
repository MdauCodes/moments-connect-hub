import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/checkout/success")({
  component: () => <StubPage title="Payment successful" />,
});
