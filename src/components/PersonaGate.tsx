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

type PersonaCardProps = {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  pills: string[];
  ctaLabel: string;
  variant: "individual" | "sme" | "corporate";
};

function PersonaCard({
  onClick,
  icon,
  title,
  description,
  pills,
  ctaLabel,
  variant,
}: PersonaCardProps) {
  const isSme = variant === "sme";

  const cardStyle =
    variant === "individual"
      ? { backgroundColor: "#FFF8ED" }
      : variant === "sme"
        ? { backgroundColor: "#2D4A35" }
        : undefined;

  const cardClass =
    variant === "corporate"
      ? "border border-border bg-white hover:border-primary/35 hover:shadow-[0_22px_55px_-34px_var(--primary)]"
      : variant === "individual"
        ? "border border-border hover:border-accent/45 hover:shadow-[0_22px_55px_-34px_var(--accent)]"
        : "border border-transparent hover:border-white/20 hover:shadow-[0_22px_55px_-34px_rgba(45,74,53,0.9)]";

  const titleClass = isSme ? "" : "text-foreground";
  const titleStyle = isSme ? { color: "#F5EDE0" } : undefined;

  const descClass = isSme ? "" : "text-muted-foreground";
  const descStyle = isSme ? { color: "#9EBA9E" } : undefined;

  const iconWrapClass =
    variant === "individual"
      ? "bg-accent/10 text-accent"
      : variant === "sme"
        ? ""
        : "bg-secondary text-accent";
  const iconWrapStyle = isSme
    ? { backgroundColor: "rgba(255,255,255,0.08)", color: "#C49A6C" }
    : undefined;

  const pillClass =
    variant === "individual"
      ? "bg-accent/10 text-accent"
      : variant === "sme"
        ? "bg-white/10"
        : "bg-secondary text-accent";
  const pillStyle = isSme ? { color: "#C4D4C4" } : undefined;

  const ctaClass =
    variant === "individual"
      ? "bg-accent text-accent-foreground hover:bg-accent/90"
      : variant === "sme"
        ? ""
        : "bg-foreground text-background hover:bg-foreground/90";
  const ctaStyle = isSme
    ? { backgroundColor: "#C49A6C", color: "#1F1F1F" }
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full cursor-pointer flex-col rounded-[1.35rem] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] active:translate-y-0 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[360px] sm:p-7 md:p-8 ${cardClass}`}
      style={cardStyle}
    >
      <div className="flex items-start gap-4 sm:block">
        <span
          className={`inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-2deg] sm:h-16 sm:w-16 ${iconWrapClass}`}
          style={iconWrapStyle}
        >
          {icon}
        </span>

        <div className="min-w-0 flex-1 sm:mt-7">
          <h2
            className={`font-display text-xl font-semibold leading-tight sm:text-2xl md:text-[1.7rem] ${titleClass}`}
            style={titleStyle}
          >
            {title}
          </h2>
          <p
            className={`mt-2 max-w-[18rem] text-sm leading-relaxed sm:mt-4 sm:text-[15px] ${descClass}`}
            style={descStyle}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5 sm:mt-7 sm:gap-2">
        {pills.map((p) => (
          <span
            key={p}
            className={`rounded-full px-2.5 py-1 text-[11px] leading-none opacity-85 transition-opacity group-hover:opacity-100 sm:px-3 sm:text-xs ${pillClass}`}
            style={pillStyle}
          >
            {p}
          </span>
        ))}
      </div>

      <span
        className={`mt-6 inline-flex w-fit items-center rounded-full px-0 py-1 text-sm font-semibold transition-all duration-300 group-hover:gap-2 sm:mt-auto sm:text-base ${ctaClass}`}
        style={ctaStyle}
      >
        {ctaLabel} <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </button>
  );
}

export function PersonaGate() {
  const { persona, setPersona } = usePersona();

  if (persona !== null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-cream px-3 py-4 sm:items-center sm:px-6 sm:py-10">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary font-display text-sm font-semibold text-primary-foreground sm:h-11 sm:w-11 sm:text-xl">
              m
            </span>
            <span className="text-left leading-tight">
              <span className="block font-display text-xs font-semibold text-foreground sm:text-base">
                Moments
              </span>
              <span className="block text-[8px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[10px]">
                Packaging Kenya
              </span>
            </span>
          </div>

          <h1 className="mt-3 font-display text-xl font-semibold leading-tight text-foreground sm:mt-8 sm:text-3xl md:text-4xl">
            Which one explains you better?
          </h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground sm:mt-3 sm:text-base">
            Who are you shopping for today?
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4 lg:gap-5">
          <PersonaCard
            variant="individual"
            onClick={() => setPersona("individual")}
            icon={<GiftIcon className="h-6 w-6 sm:h-8 sm:w-8" />}
            title="Just me — personal order"
            description="For gifts, parties, weddings or a one-off idea you want packaged beautifully."
            pills={["Wedding", "Birthday", "Event", "One-off"]}
            ctaLabel="Browse personal options"
          />

          <PersonaCard
            variant="sme"
            onClick={() => setPersona("sme")}
            icon={<StorefrontIcon className="h-6 w-6 sm:h-8 sm:w-8" />}
            title="I run a small business or shop"
            description="For cafés, shops, brands and takeaway teams that need packaging ready to move."
            pills={["Food & beverage", "Retail", "Takeaway", "Gifting"]}
            ctaLabel="Find business packaging"
          />

          <PersonaCard
            variant="corporate"
            onClick={() => setPersona("corporate")}
            icon={<BuildingIcon className="h-6 w-6 sm:h-8 sm:w-8" />}
            title="My company needs bulk orders"
            description="For repeat supply, high-volume packaging, procurement and formal quote requests."
            pills={["10,000+ units", "National brands", "Procurement"]}
            ctaLabel="Start a bulk request"
          />
        </div>

        <div className="mt-4 text-center sm:mt-6">
          <button
            type="button"
            onClick={() => setPersona("sme")}
            className="text-[11px] text-muted-foreground underline underline-offset-2 sm:text-xs"
          >
            I&apos;m just looking around for now
          </button>
        </div>
      </div>
    </div>
  );
}
