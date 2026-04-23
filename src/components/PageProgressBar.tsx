import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

export function PageProgressBar() {
  const status = useRouterState({ select: (s) => s.status });
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    if (status === "pending") {
      setOpacity(1);
      setWidth(0);
      const grow = requestAnimationFrame(() => setWidth(85));
      return () => cancelAnimationFrame(grow);
    }

    if (status === "idle") {
      setWidth(100);
      fadeTimer = setTimeout(() => setOpacity(0), 220);
      resetTimer = setTimeout(() => setWidth(0), 460);
    }

    return () => {
      if (fadeTimer) clearTimeout(fadeTimer);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [status]);

  return (
    <div
      aria-hidden="true"
      className="progress-shimmer fixed left-0 top-0 z-[100] h-[3px]"
      style={{
        width: `${width}%`,
        opacity,
        transition: "width 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out",
      }}
    />
  );
}
