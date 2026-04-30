import { useEffect, useState } from "react";
import logoUrl from "@/assets/moments-logo.png";

/**
 * Initial app splash. Mirrors the navbar branding (logo + small tagline)
 * with a themed accent/kraft shimmer sweep across the logo. Fades out
 * once the router has hydrated. Only rendered on the very first mount
 * per session — subsequent route changes use PageProgressBar.
 */
export function AppSplash() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setHidden(true), 500);
    const removeTimer = setTimeout(() => setRemoved(true), 950);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (removed) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-500 ease-out"
      style={{ opacity: hidden ? 0 : 1, pointerEvents: hidden ? "none" : "auto" }}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="splash-logo-wrap">
          <img
            src={logoUrl}
            alt=""
            width={320}
            height={100}
            className="h-20 w-auto sm:h-24"
            draggable={false}
          />
        </span>
      </div>
    </div>
  );
}
