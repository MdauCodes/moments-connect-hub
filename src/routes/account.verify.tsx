import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/account/verify")({
  component: () => <StubPage title="Verify your email" />,
});
