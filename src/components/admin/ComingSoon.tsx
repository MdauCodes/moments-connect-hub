import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    flexDirection: "column",
    gap: 8,
    color: "#8896A8",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  title: { fontSize: 16, fontWeight: 600, color: "#E2E8F0" },
  sub: { fontSize: 12, color: "#4A5568" },
};

export function ComingSoon({ label }: { label: string }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.title}>{label}</div>
      <div style={styles.sub}>Coming soon</div>
    </div>
  );
}

export default ComingSoon;
