"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RadarChartProps {
  axes: { label: string; value: number }[]; // value 0–100
  size?: number;
  className?: string;
}

/** Cognitive-profile radar. Single filled shape over hairline rings. */
export function RadarChart({ axes, size = 320, className }: RadarChartProps) {
  const reduce = useReducedMotion();
  const C = size / 2;
  const R = size / 2 - 56;
  const n = axes.length;

  const { rings, spokes, shape, labels } = useMemo(() => {
    const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
    const pt = (i: number, r: number) => ({
      x: C + Math.cos(angle(i)) * r,
      y: C + Math.sin(angle(i)) * r,
    });
    const ringPath = (r: number) =>
      Array.from({ length: n }, (_, i) => pt(i, r))
        .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(" ") + " Z";
    const rings = [0.33, 0.66, 1].map((f) => ringPath(R * f));
    const spokes = Array.from({ length: n }, (_, i) => ({ a: pt(i, 0), b: pt(i, R) }));
    const shape =
      axes
        .map((a, i) => {
          const p = pt(i, (Math.max(0, Math.min(100, a.value)) / 100) * R);
          return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ") + " Z";
    const labels = axes.map((a, i) => {
      const p = pt(i, R + 26);
      return { ...a, ...p };
    });
    return { rings, spokes, shape, labels };
  }, [axes, n, C, R]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Cognitive profile radar chart"
      className={cn("w-full max-w-md", className)}
    >
      {rings.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" className="text-border" />
      ))}
      {spokes.map((s, i) => (
        <line
          key={i}
          x1={s.a.x}
          y1={s.a.y}
          x2={s.b.x}
          y2={s.b.y}
          stroke="currentColor"
          className="text-border"
        />
      ))}
      <motion.path
        d={shape}
        fill="var(--primary)"
        fillOpacity="0.12"
        stroke="var(--primary)"
        strokeWidth="1.5"
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ transformOrigin: `${C}px ${C}px` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      {labels.map((l) => (
        <g key={l.label}>
          <text
            x={l.x}
            y={l.y - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px] font-medium uppercase tracking-[0.08em]"
          >
            {l.label}
          </text>
          <text
            x={l.x}
            y={l.y + 9}
            textAnchor="middle"
            className="fill-foreground font-mono text-[11px] tabular"
          >
            {Math.round(l.value)}
          </text>
        </g>
      ))}
    </svg>
  );
}
