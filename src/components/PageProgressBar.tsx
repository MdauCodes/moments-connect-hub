import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Editorial "drawing line" route-change indicator.
 *
 * On every route navigation, a thin clay line draws itself horizontally
 * across the very top of the viewport from left to right, then dissolves
 * once the new route has settled. No spinner, no pulse — feels like ink.
 *
 * States machine:
 *  - idle (no nav)            → line invisible, scaleX 0
 *  - pending (route loading)  → line visible, draws to scaleX ~0.85
 *  - settled (route idle)     → line completes to scaleX 1, then fades out
 */
export function PageProgressBar() {
  const status = useRouterState({ select: (s) => s.status });
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(0);
  // Drawing speed slows as route takes longer (typical ink-stroke feel).
  const [duration, setDuration] = useState(600);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    if (status === "pending") {
      // Reset, then draw to ~85% over a long, easeOut curve.
      setOpacity(1);
      setScale(0);
      setDuration(60);
      const grow = requestAnimationFrame(() => {
        setDuration(1400);
        setScale(0.85);
      });
      return () => cancelAnimationFrame(grow);
    }

    if (status === "idle") {
      // Snap to full, then fade the stroke out so it dissolves like ink drying.
      setDuration(220);
      setScale(1);
      fadeTimer = setTimeout(() => setOpacity(0), 240);
      resetTimer = setTimeout(() => {
        setScale(0);
        setDuration(0);
      }, 600);
    }

    return () => {
      if (fadeTimer) clearTimeout(fadeTimer);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [status]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-px"
      style={{ opacity, transition: "opacity 320ms ease-out" }}
    >
      <div
        className="h-full origin-left"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, var(--clay) 12%, var(--clay) 88%, transparent 100%)",
          transform: `scaleX(${scale})`,
          transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      />
    </div>
  );
}
