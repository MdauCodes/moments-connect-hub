import { useEffect, useState } from "react";

/**
 * Initial app splash. Shows a branded wordmark with a gold shimmer sweep,
 * then fades out once the router has hydrated. Only rendered on the very
 * first mount (per session) — subsequent route changes use PageProgressBar.
 */
export function AppSplash() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Give the first paint a moment, then fade.
    const fadeTimer = setTimeout(() => setHidden(true), 450);
    const removeTimer = setTimeout(() => setRemoved(true), 900);
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
      <div className="flex flex-col items-center gap-4">
        <span className="splash-shimmer font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Moments
        </span>
        <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Packaging Kenya
        </span>
      </div>
    </div>
  );
}
