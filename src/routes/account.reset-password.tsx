import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { InlineProgress } from "@/components/InlineProgress";
import { useState, type FormEvent } from "react";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { passwordStore } from "@/services/passwordStore";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/account/reset-password")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Set new password — Moments Packaging" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setSubmitting(true);
    try {
      const res = await passwordStore.reset(token ?? "", password);
      if (!res.ok) { setError(res.message ?? "Could not reset password."); return; }
      setDone(true);
      toast.success("Password updated");
      setTimeout(() => navigate({ to: "/account/login" }), 1500);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md px-5 py-20 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 font-display text-2xl">Reset link is invalid or has expired</h1>
          <Link to="/account/forgot-password" className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Request a new link</Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-5 py-16 lg:px-8 lg:py-20">
        {done ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
            <h1 className="mt-4 font-display text-2xl">Password updated</h1>
            <p className="mt-2 text-sm text-muted-foreground">Redirecting to sign in…</p>
          </div>
        ) : (
          <>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
              <KeyRound className="h-6 w-6 text-foreground/70" />
            </div>
            <h1 className="mt-5 font-display text-3xl">Set a new password</h1>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">New password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {submitting && <InlineProgress size="sm" />} Update password
              </button>
            </form>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
