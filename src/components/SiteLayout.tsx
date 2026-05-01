import { ReactNode, useEffect, useState } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { usePersona } from "@/contexts/PersonaContext";
import { PersonaGate } from "./PersonaGate";
import { PageProgressBar } from "./PageProgressBar";
import { EmailCaptureBanner } from "./EmailCaptureBanner";
import { EmailInsiderPrompt } from "./EmailInsiderPrompt";
import { AppSplash } from "./AppSplash";

const SPLASH_KEY = "moments_splash_shown";

function FirstVisitSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SPLASH_KEY)) return;
    sessionStorage.setItem(SPLASH_KEY, "1");
    setShow(true);
  }, []);

  if (!show) return null;
  return <AppSplash />;
}

function PersonaSwitchButton({ liftAbove }: { liftAbove: boolean }) {
  const { persona, setPersona } = usePersona();
  if (persona === null) return null;
  const label = persona === "sme" ? "SME" : persona === "corporate" ? "Corporate" : "Individual";
  return (
    <button
      type="button"
      onClick={() => setPersona(null)}
      className={`fixed left-4 z-40 inline-flex items-center gap-1 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground/80 shadow-sm backdrop-blur transition-all duration-300 hover:bg-secondary sm:left-6 sm:px-3 sm:py-1.5 sm:text-xs ${
        liftAbove ? "bottom-24 sm:bottom-24" : "bottom-4 sm:bottom-6"
      }`}
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
  const [bannerVisible, setBannerVisible] = useState(false);
  return (
    <>
      <FirstVisitSplash />
      <PageProgressBar />
      <ScrollLock />
      <PersonaGate />
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppFloat />
        <PersonaSwitchButton liftAbove={bannerVisible} />
        <EmailCaptureBanner onVisibilityChange={setBannerVisible} />
        <EmailInsiderPrompt />
      </div>
    </>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return <LayoutShell>{children}</LayoutShell>;
}
