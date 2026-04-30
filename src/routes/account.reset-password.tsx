import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/account/reset-password")({
  component: () => <StubPage title="Set a new password" />,
});
