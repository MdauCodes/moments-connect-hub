import { useEffect, useState } from "react";
import logoUrl from "@/assets/moments-logo.png";

/**
 * Branded app splash — kraft paper unfolds open like a packaging flap,
 * revealing the logo. Fades out at 750ms, removed from DOM at 1200ms.
 */
export function AppSplash() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const openTimer = requestAnimationFrame(() => setOpen(true));
    const fadeTimer = setTimeout(() => setHidden(true), 750);
    const removeTimer = setTimeout(() => setRemoved(true), 1200);
    return () => {
      cancelAnimationFrame(openTimer);
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
        backgroundColor: "var(--cream)",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      <style>{`
        .mpk-splash-stage { perspective: 900px; }
        .mpk-flap {
          position: absolute;
          inset: 0;
          width: 50%;
          background:
            linear-gradient(135deg,
              color-mix(in oklab, var(--kraft) 92%, black) 0%,
              var(--kraft) 45%,
              color-mix(in oklab, var(--kraft) 80%, white) 100%);
          background-image:
            radial-gradient(circle at 22% 30%, oklch(0.5 0.04 60 / 0.10) 1px, transparent 1px),
            radial-gradient(circle at 70% 65%, oklch(0.5 0.04 60 / 0.08) 1px, transparent 1px),
            linear-gradient(135deg,
              color-mix(in oklab, var(--kraft) 92%, black) 0%,
              var(--kraft) 45%,
              color-mix(in oklab, var(--kraft) 80%, white) 100%);
          background-size: 5px 5px, 7px 7px, 100% 100%;
          box-shadow: 0 12px 30px oklch(0.18 0.02 60 / 0.18);
          transition: transform 700ms cubic-bezier(0.7, 0, 0.2, 1);
          transform-origin: left center;
          will-change: transform;
        }
        .mpk-flap.right {
          left: 50%;
          transform-origin: right center;
        }
        .mpk-flap.left.is-open  { transform: rotateY(-105deg); }
        .mpk-flap.right.is-open { transform: rotateY(105deg); }
        .mpk-flap::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: oklch(0.18 0.02 60 / 0.18);
        }
        .mpk-flap.left::after  { right: 0; }
        .mpk-flap.right::after { left: 0; }
        .mpk-splash-content {
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 400ms ease-out 280ms, transform 400ms ease-out 280ms;
        }
        .mpk-splash-content.is-open { opacity: 1; transform: translateY(0); }
      `}</style>

      <div className="mpk-splash-stage relative w-[min(420px,82vw)] aspect-[16/9] overflow-hidden rounded-md">
        {/* The two kraft flaps that unfold outward */}
        <div className={`mpk-flap left ${open ? "is-open" : ""}`} />
        <div className={`mpk-flap right ${open ? "is-open" : ""}`} />

        {/* Logo + tagline revealed underneath */}
        <div className={`mpk-splash-content absolute inset-0 flex flex-col items-center justify-center gap-3 ${open ? "is-open" : ""}`}>
          <img
            src={logoUrl}
            alt=""
            width={320}
            height={100}
            className="h-20 w-auto sm:h-24"
            draggable={false}
          />
          <p
            style={{ color: "var(--forest)" }}
            className="text-[10px] uppercase tracking-[0.25em] font-medium"
          >
            Premium Packaging · Nairobi
          </p>
        </div>
      </div>
    </div>
  );
}
