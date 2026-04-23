import { useEffect, useState } from "react";
import { EMAIL_CAPTURE_ENABLED } from "@/config/features";
import { usePersona } from "@/contexts/PersonaContext";
import { api } from "@/services/api";

const STORAGE_KEY = "moments_email_banner";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type DismissedRecord = { value: "dismissed"; dismissedAt: number };

function readStoredState(): "hidden" | "show" {
  if (typeof window === "undefined") return "hidden";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return "show";
    if (raw === "submitted") return "hidden";
    // Try JSON dismissed record
    try {
      const parsed = JSON.parse(raw) as DismissedRecord;
      if (parsed?.value === "dismissed" && typeof parsed.dismissedAt === "number") {
        if (Date.now() - parsed.dismissedAt < SEVEN_DAYS_MS) return "hidden";
      }
    } catch {
      // legacy / unknown — treat as show
    }
    return "show";
  } catch {
    return "show";
  }
}

export function EmailCaptureBanner() {
  const { persona } = usePersona();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!EMAIL_CAPTURE_ENABLED) return;
    setVisible(readStoredState() === "show");
  }, []);

  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, [submitted]);

  if (!EMAIL_CAPTURE_ENABLED) return null;
  if (!visible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed) || trimmed.length > 255) {
      setError("Please enter a valid email address");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.submitLead(trimmed, persona ?? "unknown");
      try {
        window.localStorage.setItem(STORAGE_KEY, "submitted");
      } catch {
        // ignore
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    try {
      const record: DismissedRecord = { value: "dismissed", dismissedAt: Date.now() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-wrap items-center justify-between gap-4 bg-primary px-5 py-3 text-primary-foreground">
      {submitted ? (
        <p className="mx-auto text-sm font-medium">Thank you! 🎉 You&apos;re on the list.</p>
      ) : (
        <>
          <p className="text-sm">
            Get packaging tips and exclusive offers — straight to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2 sm:flex-none">
            <div className="flex flex-1 flex-col sm:flex-none">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                maxLength={255}
                disabled={loading}
                className="w-full rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 sm:w-[220px]"
              />
              {error && (
                <span className="mt-1 text-[11px] text-primary-foreground/80">{error}</span>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-primary-foreground px-5 py-2 text-sm font-medium text-primary disabled:opacity-70"
            >
              {loading ? "..." : "Subscribe"}
            </button>
          </form>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="ml-2 cursor-pointer text-xl text-primary-foreground/60 hover:text-primary-foreground"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
