import { usePersona } from "@/contexts/PersonaContext";

export function PersonaGate() {
  const { persona, setPersona } = usePersona();

  if (persona !== null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-cream px-5 py-10">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-primary font-display text-xl font-semibold text-primary-foreground">
              m
            </span>
            <span className="text-left leading-tight">
              <span className="block font-display text-base font-semibold text-foreground">
                Moments
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Packaging Kenya
              </span>
            </span>
          </div>

          <h1 className="mt-8 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Which one explains your business better?
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            We&apos;ll show you exactly what&apos;s relevant to you.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {/* CARD 1 — SME */}
          <button
            type="button"
            onClick={() => setPersona("sme")}
            className="flex flex-1 cursor-pointer flex-col rounded-2xl p-6 text-left transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: "#2D4A35" }}
          >
            <span className="text-[28px] leading-none">🛍️</span>
            <h2
              className="mt-4 font-display text-xl font-semibold"
              style={{ color: "#F5EDE0" }}
            >
              I run a restaurant, café, shop or brand
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#9EBA9E" }}>
              You want quality packaging fast, without a complicated process.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Food & beverage", "Retail", "Takeaway", "Gifting"].map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-[10px]"
                  style={{ color: "#C4D4C4" }}
                >
                  {p}
                </span>
              ))}
            </div>
            <span
              className="mt-5 text-sm font-medium"
              style={{ color: "#C49A6C" }}
            >
              Let&apos;s go →
            </span>
          </button>

          {/* CARD 2 — Corporate */}
          <button
            type="button"
            onClick={() => setPersona("corporate")}
            className="flex flex-1 cursor-pointer flex-col rounded-2xl border border-border bg-white p-6 text-left transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-[28px] leading-none">🏢</span>
            <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
              I buy packaging for a large company or chain
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You need volume, contracts, a dedicated contact and formal quotes.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["10,000+ units", "National brands", "Procurement"].map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-accent"
                >
                  {p}
                </span>
              ))}
            </div>
            <span className="mt-5 text-sm font-medium text-foreground">
              Talk to our team →
            </span>
          </button>

          {/* CARD 3 — Individual */}
          <button
            type="button"
            onClick={() => setPersona("individual")}
            className="flex flex-1 cursor-pointer flex-col rounded-2xl border border-border p-6 text-left transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: "#FDF8F0" }}
          >
            <span className="text-[28px] leading-none">🎁</span>
            <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
              I need packaging for an event, gift or personal use
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No minimums pressure. Just find what you need and we&apos;ll sort you out.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Wedding", "Birthday", "Personal order", "One-off"].map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] text-accent"
                >
                  {p}
                </span>
              ))}
            </div>
            <span className="mt-5 text-sm font-medium text-accent">
              Show me what&apos;s available →
            </span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setPersona("sme")}
            className="text-xs text-muted-foreground underline underline-offset-2"
          >
            I&apos;m just looking around for now
          </button>
        </div>
      </div>
    </div>
  );
}
