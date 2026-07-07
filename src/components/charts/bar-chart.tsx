"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Bar {
  label: string;
  value: number;
  accent?: boolean;
}

interface BarChartProps {
  bars: Bar[];
  max?: number;
  unit?: string;
  className?: string;
  format?: (v: number) => string;
}

/** Horizontal bars, reads like a table, scans like a chart. */
export function BarChart({ bars, max, unit, className, format }: BarChartProps) {
  const reduce = useReducedMotion();
  const ceiling = max ?? Math.max(...bars.map((b) => b.value), 1) * 1.05;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {bars.map((b, i) => (
        <div key={b.label} className="grid grid-cols-[7.5rem_1fr_4rem] items-center gap-3">
          <span className="truncate text-xs text-muted-foreground">{b.label}</span>
          <div className="h-1.5 bg-muted">
            <motion.div
              className={cn("h-full", b.accent ? "bg-primary" : "bg-faint")}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${Math.min((b.value / ceiling) * 100, 100)}%` }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="text-right font-mono text-xs tabular text-foreground">
            {format ? format(b.value) : b.value}
            {unit ? <span className="text-faint"> {unit}</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
