import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/checkout/processing")({
  component: () => <StubPage title="Processing payment…" />,
});
