import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, MailCheck } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { passwordStore } from "@/services/passwordStore";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/account/verify")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Verify email — Moments Packaging" }, { name: "robots", content: "noindex" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(token ? "loading" : "idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const res = await passwordStore.verifyEmail(token);
      if (cancelled) return;
      if (res.ok) setState("success");
      else { setError(res.message ?? "Verification failed"); setState("error"); }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-5 py-20 text-center">
        {state === "idle" && (
          <>
            <MailCheck className="mx-auto h-12 w-12 text-accent" />
            <h1 className="mt-4 font-display text-2xl">Check your email</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We sent a verification link to your inbox. Click it to activate your account.
            </p>
            <Link to="/account/login" className="mt-6 inline-block rounded-full border border-border px-5 py-2.5 text-sm hover:bg-secondary">
              Back to sign in
            </Link>
          </>
        )}
        {state === "loading" && (
          <div>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-accent" />
            <p className="mt-4 text-sm text-muted-foreground">Verifying your email…</p>
          </div>
        )}
        {state === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
            <h1 className="mt-4 font-display text-2xl">Email verified</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your account is now active.</p>
            <Link to="/account/login" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Sign in
            </Link>
          </>
        )}
        {state === "error" && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 font-display text-2xl">Verification failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Link to="/account/login" className="mt-6 inline-block rounded-full border border-border px-5 py-2.5 text-sm hover:bg-secondary">
              Back to sign in
            </Link>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
