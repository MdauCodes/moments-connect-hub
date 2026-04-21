import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { PersonaProvider, usePersona } from "@/contexts/PersonaContext";
import { PersonaGate } from "./PersonaGate";

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

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PersonaGate />
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppFloat />
        <PersonaSwitchButton />
      </div>
    </>
  );
}
