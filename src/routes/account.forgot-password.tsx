import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/account/forgot-password")({
  component: () => <StubPage title="Reset your password" />,
});
