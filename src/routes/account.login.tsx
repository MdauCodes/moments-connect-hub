import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/account/login")({
  component: () => <StubPage title="Sign in" />,
});
