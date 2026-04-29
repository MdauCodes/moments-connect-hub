import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPage } from "./admin.login";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginAliasPage,
});

function LoginAliasPage() {
  const { redirect } = Route.useSearch();
  return <AdminLoginPage redirect={redirect} />;
}
