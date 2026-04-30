import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/orders/track")({
  component: () => <StubPage title="Track your order" description="Enter a reference to track delivery." />,
});
