import { useEffect, useState } from "react";
import cloudImg from "@/assets/packaging-cloud-hero.png";

/**
 * Roving spotlight regions over the dense packaging photo.
 * Coordinates are % of the image (0-100). Tuned to land roughly
 * over recognisable items in src/assets/packaging-cloud-hero.png.
 */
const SPOTS: Array<{ x: number; y: number; label: string }> = [
  { x: 38, y: 30, label: "Kraft carrier bags" },
  { x: 62, y: 22, label: "Shopping bags" },
  { x: 50, y: 48, label: "Coffee cups & lids" },
  { x: 30, y: 58, label: "Takeaway boxes" },
  { x: 70, y: 52, label: "Food boxes" },
  { x: 55, y: 72, label: "Jars & tubs" },
  { x: 35, y: 80, label: "Pizza & meal boxes" },
  { x: 75, y: 78, label: "Bottles & containers" },
  { x: 22, y: 38, label: "Mailers & shipping" },
  { x: 78, y: 35, label: "Gift & retail boxes" },
];

export function PackagingCloud() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % SPOTS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  const active = SPOTS[activeIdx];

  return (
    <div className="relative h-full w-full select-none">
      {/* Slow drifting cluster */}
      <div
        className="relative h-full w-full"
        style={{ animation: "pkg-drift 18s ease-in-out infinite" }}
      >
        <img
          src={cloudImg}
          alt="A cluster of branded kraft paper packaging — bags, boxes, cups, jars, mailers and more"
          width={1280}
          height={1280}
          className="h-full w-full object-contain"
          style={{
            filter: "drop-shadow(0 30px 40px rgb(0 0 0 / 0.12))",
          }}
        />

        {/* Roving spotlight glow */}
        <div
          className="pointer-events-none absolute h-[28%] w-[28%] rounded-full transition-all duration-1000 ease-out"
          style={{
            left: `${active.x}%`,
            top: `${active.y}%`,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgb(212 165 116 / 0.55) 0%, rgb(212 165 116 / 0.15) 40%, transparent 70%)",
            filter: "blur(8px)",
            mixBlendMode: "screen",
          }}
          aria-hidden
        />

        {/* Subtle ring marker */}
        <div
          className="pointer-events-none absolute h-[14%] w-[14%] rounded-full border border-accent/60 transition-all duration-1000 ease-out"
          style={{
            left: `${active.x}%`,
            top: `${active.y}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 6px rgb(212 165 116 / 0.12)",
          }}
          aria-hidden
        />
      </div>

      {/* Floating label — positioned relative to the parent (not the drifting layer) */}
      <div
        key={activeIdx}
        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 animate-fade-in"
        style={{
          left: `${active.x}%`,
          top: `${active.y + 14}%`,
        }}
      >
        <span className="whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-background shadow-lg">
          {active.label}
        </span>
      </div>

      <style>{`
        @keyframes pkg-drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25%      { transform: translate(-1.2%, -1.5%) rotate(-0.6deg); }
          50%      { transform: translate(0.8%, 1%) rotate(0.4deg); }
          75%      { transform: translate(-0.6%, 1.5%) rotate(-0.3deg); }
        }
      `}</style>
    </div>
  );
}
