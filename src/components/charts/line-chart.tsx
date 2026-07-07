"use client";

import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Series {
  name: string;
  points: { x: number; y: number }[];
  accent?: boolean;
}

interface LineChartProps {
  series: Series[];
  height?: number;
  yLabel?: string;
  xTicks?: (x: number) => string;
  yTicks?: (y: number) => string;
  className?: string;
  area?: boolean;
}

/**
 * Minimal line chart. No library, a chart this simple should weigh nothing.
 * Grid is drawn as hairlines, the primary series in accent, others neutral.
 */
export function LineChart({
  series,
  height = 220,
  yLabel,
  xTicks,
  yTicks,
  className,
  area = true,
}: LineChartProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const W = 720;
  const H = height;
  const PAD = { t: 12, r: 12, b: 26, l: 44 };

  const { paths, gridY, labelsX } = useMemo(() => {
    const all = series.flatMap((s) => s.points);
    if (all.length === 0) return { paths: [], gridY: [], labelsX: [] };
    const xs = all.map((p) => p.x);
    const ys = all.map((p) => p.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(0, ...ys);
    const yMax = Math.max(...ys) * 1.08 || 1;
    const sx = (x: number) =>
      PAD.l + ((x - xMin) / Math.max(xMax - xMin, 1e-9)) * (W - PAD.l - PAD.r);
    const sy = (y: number) =>
      H - PAD.b - ((y - yMin) / Math.max(yMax - yMin, 1e-9)) * (H - PAD.t - PAD.b);

    const paths = series.map((s) => {
      const sorted = [...s.points].sort((a, b) => a.x - b.x);
      const d = sorted
        .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
        .join(" ");
      const areaD = sorted.length
        ? `${d} L${sx(sorted[sorted.length - 1].x).toFixed(1)},${H - PAD.b} L${sx(sorted[0].x).toFixed(1)},${H - PAD.b} Z`
        : "";
      const end = sorted[sorted.length - 1];
      return {
        ...s,
        d,
        areaD,
        last: end ? { x: sx(end.x), y: sy(end.y) } : null,
      };
    });

    const gridY = Array.from({ length: 4 }, (_, i) => {
      const v = yMin + ((yMax - yMin) * (i + 1)) / 4;
      return { y: sy(v), v };
    });
    const labelsX = Array.from({ length: 5 }, (_, i) => {
      const v = xMin + ((xMax - xMin) * i) / 4;
      return { x: sx(v), v };
    });
    return { paths, gridY, labelsX };
  }, [series, H, PAD.b, PAD.l, PAD.r, PAD.t]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={yLabel ?? "Line chart"}
      className={cn("w-full", className)}
    >
      {gridY.map((g, i) => (
        <g key={i}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={g.y}
            y2={g.y}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
          />
          <text
            x={PAD.l - 8}
            y={g.y + 3}
            textAnchor="end"
            className="fill-faint font-mono text-[10px] tabular"
          >
            {yTicks ? yTicks(g.v) : Math.round(g.v)}
          </text>
        </g>
      ))}
      {labelsX.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={H - 8}
          textAnchor="middle"
          className="fill-faint font-mono text-[10px] tabular"
        >
          {xTicks ? xTicks(l.v) : Math.round(l.v)}
        </text>
      ))}
      {paths.map((p, i) => (
        <g key={p.name}>
          {area && p.accent ? (
            <>
              <defs>
                <linearGradient id={`${id}-a${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={p.areaD} fill={`url(#${id}-a${i})`} />
            </>
          ) : null}
          <motion.path
            d={p.d}
            fill="none"
            stroke={p.accent ? "var(--primary)" : "var(--muted-foreground)"}
            strokeWidth={p.accent ? 1.75 : 1.25}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          {p.last ? (
            <circle
              cx={p.last.x}
              cy={p.last.y}
              r="3"
              fill={p.accent ? "var(--primary)" : "var(--muted-foreground)"}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}
