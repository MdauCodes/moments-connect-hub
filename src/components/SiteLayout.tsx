import { ReactNode, useEffect, useState } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { usePersona } from "@/contexts/PersonaContext";
import { PersonaGate } from "./PersonaGate";
import { BasketPill } from "./BasketPill";
import { BasketDrawer } from "./BasketDrawer";

function PersonaSwitchButton() {
  const { persona, setPersona } = usePersona();
  if (persona === null) return null;
  const label = persona === "sme" ? "SME" : "Corporate";
  return (
    <button
      type="button"
      onClick={() => setPersona(null)}
      className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-1 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground/80 shadow-sm backdrop-blur transition-colors hover:bg-secondary sm:bottom-6 sm:left-6 sm:px-3 sm:py-1.5 sm:text-xs"
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

function LayoutShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <ScrollLock />
      <PersonaGate />
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppFloat />
        <PersonaSwitchButton />
        <BasketPill onOpen={() => setDrawerOpen(true)} />
        <BasketDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return <LayoutShell>{children}</LayoutShell>;
}
