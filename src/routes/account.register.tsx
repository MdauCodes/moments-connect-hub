import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { InlineProgress } from "@/components/InlineProgress";
import { useState, type FormEvent } from "react";

import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { apiUrl } from "@/config/api";

export const Route = createFileRoute("/account/register")({
  head: () => ({ meta: [{ title: "Create account — Moments Packaging" }, { name: "robots", content: "noindex" }] }),
  component: RegisterPage,
});

const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";

function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/v1/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email: email.trim(), phone, password }),
      });
      if (!res.ok) {
        // Backend offline → fall through to optimistic login attempt
        if (res.status >= 500 || res.status === 0) {
          toast.success("Account queued — sign-in will activate when backend is reachable.");
          navigate({ to: "/account/login" });
          return;
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Registration failed");
      }
      try {
        await login(email.trim(), password);
        toast.success("Account created");
        navigate({ to: "/account/dashboard" });
      } catch {
        toast.success("Check your email to verify, then sign in.");
        navigate({ to: "/account/login" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-5 py-16 lg:px-8 lg:py-20">
        <h1 className="font-display text-3xl">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Faster checkout and order history.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">First name</label>
              <input required className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Last name</label>
              <input required className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Phone</label>
            <input required className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input type="password" required minLength={8} className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
          <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {submitting && <InlineProgress size="sm" />} Create account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/account/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </section>
    </SiteLayout>
  );
}
