/**
 * DivisionBadge — small, monospaced label that sub-consciously
 * signals which side of the business a section, page, or product
 * sits in. Used in headers, hero, breadcrumbs.
 */
import type { Division } from "@/data/products";

const styles: Record<Division, { label: string; dotClass: string }> = {
  food: { label: "Food Service", dotClass: "bg-[color:var(--clay)]" },
  "retail-industrial": { label: "Retail & Industrial", dotClass: "bg-[color:var(--forest)]" },
};

export function DivisionBadge({ division, className = "" }: { division: Division; className?: string }) {
  const s = styles[division];
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground ${className}`}>
      <span className={`h-1.5 w-1.5 ${s.dotClass}`} aria-hidden />
      {s.label}
    </span>
  );
}
