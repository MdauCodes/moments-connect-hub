import { useEffect, useState } from "react";
import carrierBag from "@/assets/pkg-carrier-bag.png";
import foodBox from "@/assets/pkg-food-box.png";
import cup from "@/assets/pkg-cup.png";
import mailer from "@/assets/pkg-mailer.png";
import giftBox from "@/assets/pkg-gift-box.png";
import pouch from "@/assets/pkg-pouch.png";
import shippingBox from "@/assets/pkg-shipping-box.png";
import pizzaBox from "@/assets/pkg-pizza-box.png";

interface PackageItem {
  src: string;
  label: string;
  /** orbit position 0–7 around the cluster */
  pos: number;
  /** scale multiplier vs base */
  scale: number;
  /** seconds offset for the float keyframe */
  floatDelay: number;
}

const ITEMS: PackageItem[] = [
  { src: carrierBag, label: "Kraft carrier bags", pos: 0, scale: 1.15, floatDelay: 0 },
  { src: foodBox, label: "Food takeaway boxes", pos: 1, scale: 0.95, floatDelay: 1.2 },
  { src: cup, label: "Branded paper cups", pos: 2, scale: 0.85, floatDelay: 2.4 },
  { src: pizzaBox, label: "Pizza & flat boxes", pos: 3, scale: 1.0, floatDelay: 0.6 },
  { src: shippingBox, label: "Shipping & retail boxes", pos: 4, scale: 1.2, floatDelay: 1.8 },
  { src: mailer, label: "Mailer envelopes", pos: 5, scale: 0.9, floatDelay: 3.0 },
  { src: pouch, label: "Stand-up pouches", pos: 6, scale: 0.95, floatDelay: 0.9 },
  { src: giftBox, label: "Gift & retail boxes", pos: 7, scale: 0.9, floatDelay: 2.1 },
];

// Hand-tuned positions (% of container) for an organic orbital cluster.
// Center hole is roughly (50, 50); items fall in a loose ring around it.
const ORBIT_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 18, y: 28 },  // top-left
  { x: 50, y: 12 },  // top-center
  { x: 82, y: 26 },  // top-right
  { x: 92, y: 58 },  // mid-right
  { x: 70, y: 84 },  // bottom-right (hero — bigger)
  { x: 32, y: 86 },  // bottom-left
  { x: 8,  y: 60 },  // mid-left
  { x: 50, y: 50 },  // center floater
];

export function PackagingCloud() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % ITEMS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative aspect-square w-full select-none" aria-hidden="true">
      {/* Soft radial glow that follows the active item */}
      <div
        className="pointer-events-none absolute h-[55%] w-[55%] rounded-full bg-accent/20 blur-3xl transition-all duration-1000 ease-out"
        style={{
          left: `${ORBIT_POSITIONS[activeIdx].x}%`,
          top: `${ORBIT_POSITIONS[activeIdx].y}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {ITEMS.map((item, i) => {
        const pos = ORBIT_POSITIONS[item.pos];
        const isActive = i === activeIdx;
        const baseSize = 28; // % of container width at scale 1
        const size = baseSize * item.scale;

        return (
          <div
            key={item.label}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${size}%`,
              height: `${size}%`,
              transform: "translate(-50%, -50%)",
              animation: `pkg-float 6s ease-in-out ${item.floatDelay}s infinite`,
            }}
          >
            <div
              className={`relative h-full w-full transition-all duration-700 ease-out ${
                isActive ? "scale-125 z-20" : "scale-100 z-10 opacity-70"
              }`}
              style={{
                filter: isActive
                  ? "drop-shadow(0 20px 25px rgb(0 0 0 / 0.18)) drop-shadow(0 0 30px rgb(212 165 116 / 0.45))"
                  : "drop-shadow(0 10px 15px rgb(0 0 0 / 0.08))",
              }}
            >
              <img
                src={item.src}
                alt=""
                className="h-full w-full object-contain"
                width={768}
                height={768}
                loading={i < 3 ? "eager" : "lazy"}
              />
            </div>

            {/* Label that appears under the active item */}
            <div
              className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-background transition-all duration-500 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
              }`}
            >
              {item.label}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes pkg-float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50%      { transform: translate(-50%, -50%) translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
