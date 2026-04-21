import { usePersona } from "@/contexts/PersonaContext";

export function PersonaGate() {
  const { persona, setPersona } = usePersona();

  if (persona !== null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream px-5 py-10 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-primary text-primary-foreground font-display text-xl font-semibold">
              m
            </span>
            <span className="leading-tight text-left">
              <span className="block font-display text-base font-semibold text-foreground">
                Moments
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Packaging Kenya
              </span>
            </span>
          </div>

          <h1 className="mt-8 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Who are you ordering for?
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            We'll tailor your experience.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPersona("sme")}
            className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              SME
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
              Restaurant, Café or Retailer
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Small to medium orders, quick turnaround, WhatsApp-friendly.
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-medium text-primary">
              Continue →
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPersona("corporate")}
            className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Enterprise
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
              Corporate or Enterprise Brand
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Volume orders, contracts, dedicated production slots.
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-medium text-primary">
              Continue →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
