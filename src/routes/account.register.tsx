import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/account/register")({
  component: () => <StubPage title="Create your account" />,
});
