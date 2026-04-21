import { ReactNode, useEffect } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { usePersona } from "@/contexts/PersonaContext";
import { PersonaGate } from "./PersonaGate";
import { BasketProvider } from "@/contexts/BasketContext";
import { BasketPill } from "./BasketPill";

function PersonaSwitchButton() {
  const { persona, setPersona } = usePersona();
  if (persona === null) return null;
  const label = persona === "sme" ? "SME" : "Corporate";
  return (
    <button
      type="button"
      onClick={() => setPersona(null)}
      className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-1 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-sm backdrop-blur transition-colors hover:bg-secondary"
      aria-label="Switch persona"
    >
      <span className="text-muted-foreground">Viewing as {label}</span>
      <span>Switch ↓</span>
    </button>
  );
}

function ScrollLock() {
  const { persona } = usePersona();
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (persona === null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [persona]);
  return null;
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <BasketProvider>
      <ScrollLock />
      <PersonaGate />
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppFloat />
        <PersonaSwitchButton />
        <BasketPill />
      </div>
    </BasketProvider>
  );
}
