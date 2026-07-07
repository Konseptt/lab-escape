import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  accent?: boolean;
  className?: string;
}

/** Instrument-panel numeral. Mono, tabular, labeled in micro caps. */
export function Stat({ label, value, unit, hint, accent, className }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="label-micro text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono text-2xl tabular leading-none tracking-tight",
          accent ? "text-primary" : "text-foreground"
        )}
      >
        {value}
        {unit ? (
          <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
        ) : null}
      </span>
      {hint ? <span className="text-xs text-faint">{hint}</span> : null}
    </div>
  );
}
