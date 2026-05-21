import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineProgress } from "@/components/InlineProgress";
import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { passwordStore } from "@/services/passwordStore";

export const Route = createFileRoute("/account/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Moments Packaging" }, { name: "robots", content: "noindex" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await passwordStore.requestReset(email.trim());
      if (!res.ok) {
        setError(res.message ?? "Could not send reset link.");
        return;
      }
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-5 py-16 lg:px-8 lg:py-20">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/15">
              <CheckCircle2 className="h-7 w-7 text-accent" />
            </div>
            <h1 className="mt-5 font-display text-3xl">Check your inbox</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              If an account exists for <span className="font-semibold text-foreground">{email}</span>,
              we've sent a reset link. It expires in 30 minutes.
            </p>
            <Link to="/account/login" className="mt-8 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
              <Mail className="h-6 w-6 text-foreground/70" />
            </div>
            <h1 className="mt-5 font-display text-3xl">Forgot password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {submitting && <InlineProgress size="sm" />} Send reset link
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Remember it? <Link to="/account/login" className="text-accent hover:underline">Sign in</Link>
              </p>
            </form>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
