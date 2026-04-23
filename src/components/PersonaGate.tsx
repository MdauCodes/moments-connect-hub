import { usePersona } from "@/contexts/PersonaContext";

type IconProps = { className?: string };

function GiftIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
      <path d="M2 8h20v4H2z" />
      <path d="M12 21V8" />
      <path d="M12 8a3 3 0 0 1-3-3 2 2 0 0 1 3-1.5A2 2 0 0 1 15 5a3 3 0 0 1-3 3z" />
    </svg>
  );
}

function StorefrontIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9v1a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0V9" />
      <path d="M5 11v9h14v-9" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

function BuildingIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" />
      <path d="M15 9h4a1 1 0 0 1 1 1v11" />
      <path d="M2 21h20" />
      <path d="M8 8h2M8 12h2M8 16h2" />
      <path d="M18 13h.01M18 17h.01" />
    </svg>
  );
}

export function PersonaGate() {
  const { persona, setPersona } = usePersona();

  if (persona !== null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-cream px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary font-display text-base font-semibold text-primary-foreground sm:h-11 sm:w-11 sm:text-xl">
              m
            </span>
            <span className="text-left leading-tight">
              <span className="block font-display text-sm font-semibold text-foreground sm:text-base">
                Moments
              </span>
              <span className="block text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[10px]">
                Packaging Kenya
              </span>
            </span>
          </div>

          <h1 className="mt-5 font-display text-xl font-semibold leading-tight text-foreground sm:mt-8 sm:text-3xl md:text-4xl">
            Which one explains you better?
          </h1>
          <p className="mt-2 max-w-md text-xs text-muted-foreground sm:mt-3 sm:text-base">
            We&apos;ll show you exactly what&apos;s relevant to you.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3">
          {/* CARD 1 — Individual */}
          <button
            type="button"
            onClick={() => setPersona("individual")}
            className="group flex cursor-pointer flex-col rounded-2xl border border-border p-4 text-left transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
            style={{ backgroundColor: "#FDF8F0" }}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent sm:h-11 sm:w-11">
              <GiftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <h2 className="mt-3 font-display text-base font-semibold leading-snug text-foreground sm:mt-4 sm:text-lg md:text-xl">
              I&apos;m an individual looking for packaging
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
              For a wedding, birthday, event or personal order — no minimums, no pressure.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
              {["Wedding", "Birthday", "Event", "One-off"].map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent sm:px-2.5 sm:py-1"
                >
                  {p}
                </span>
              ))}
            </div>
            <span className="mt-4 text-xs font-medium text-accent sm:mt-5 sm:text-sm">
              Show me what&apos;s available →
            </span>
          </button>

          {/* CARD 2 — SME */}
          <button
            type="button"
            onClick={() => setPersona("sme")}
            className="group flex cursor-pointer flex-col rounded-2xl p-4 text-left transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
            style={{ backgroundColor: "#2D4A35" }}
          >
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full sm:h-11 sm:w-11"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#C49A6C" }}
            >
              <StorefrontIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <h2
              className="mt-3 font-display text-base font-semibold leading-snug sm:mt-4 sm:text-lg md:text-xl"
              style={{ color: "#F5EDE0" }}
            >
              I run a small business or shop
            </h2>
            <p className="mt-1.5 text-xs sm:mt-2 sm:text-sm" style={{ color: "#9EBA9E" }}>
              Restaurant, café, retail or brand — quality packaging fast, without the runaround.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
              {["Food & beverage", "Retail", "Takeaway", "Gifting"].map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1"
                  style={{ color: "#C4D4C4" }}
                >
                  {p}
                </span>
              ))}
            </div>
            <span
              className="mt-4 text-xs font-medium sm:mt-5 sm:text-sm"
              style={{ color: "#C49A6C" }}
            >
              Let&apos;s go →
            </span>
          </button>

          {/* CARD 3 — Corporate */}
          <button
            type="button"
            onClick={() => setPersona("corporate")}
            className="group flex cursor-pointer flex-col rounded-2xl border border-border bg-white p-4 text-left transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-accent sm:h-11 sm:w-11">
              <BuildingIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <h2 className="mt-3 font-display text-base font-semibold leading-snug text-foreground sm:mt-4 sm:text-lg md:text-xl">
              We&apos;re a company or large operation
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
              Volume orders, contracts and procurement — with a dedicated contact and formal quotes.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
              {["10,000+ units", "National brands", "Procurement"].map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-accent sm:px-2.5 sm:py-1"
                >
                  {p}
                </span>
              ))}
            </div>
            <span className="mt-4 text-xs font-medium text-foreground sm:mt-5 sm:text-sm">
              Talk to our team →
            </span>
          </button>
        </div>

        <div className="mt-5 text-center sm:mt-6">
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
