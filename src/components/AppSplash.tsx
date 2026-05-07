import { useEffect, useState } from "react";
import logoUrl from "@/assets/moments-logo.png";

/**
 * Branded app splash — cream background, logo, animated progress bar,
 * tagline. Fades out at 500ms, removed from DOM at 950ms.
 */
export function AppSplash() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Kick off the progress bar on next frame so CSS transition fires
    const kickTimer = requestAnimationFrame(() => setProgress(100));
    const fadeTimer = setTimeout(() => setHidden(true), 500);
    const removeTimer = setTimeout(() => setRemoved(true), 950);
    return () => {
      cancelAnimationFrame(kickTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (removed) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-500 ease-out"
      style={{
        backgroundColor: "#F5F0E8",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <img src={logoUrl} alt="" width={320} height={100} className="h-24 w-auto sm:h-28" draggable={false} />

        {/* Animated progress bar */}
        <div className="w-48 h-[2px] rounded-full overflow-hidden bg-black/10">
          <div
            className="h-full rounded-full origin-left"
            style={{
              backgroundColor: "#2D5A3D",
              width: `${progress}%`,
              transition: "width 480ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>

        {/* Tagline */}
        <p style={{ color: "#2D5A3D" }} className="text-[10px] uppercase tracking-[0.25em] font-medium">
          Premium Packaging · Nairobi
        </p>
      </div>
    </div>
  );
}
