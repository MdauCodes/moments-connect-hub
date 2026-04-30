import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/enterprise-quote")({
  component: () => (
    <StubPage
      title="Enterprise quote"
      description="Talk to our team about volume pricing, contracts and dedicated production slots."
    />
  ),
});
