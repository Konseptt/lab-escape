"use client";

import { cn } from "@/lib/utils";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  accent?: boolean;
  className?: string;
}

export function Sparkline({
  values,
  width = 120,
  height = 28,
  accent,
  className,
}: SparklineProps) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1e-9);
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (width - 4) + 2;
      const y = height - 3 - ((v - min) / span) * (height - 6);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path
        d={d}
        fill="none"
        stroke={accent ? "var(--primary)" : "var(--muted-foreground)"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
