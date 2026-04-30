import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/cart")({
  component: () => <StubPage title="Your Cart" description="Cart page coming soon." />,
});
