"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Activity } from "lucide-react";
import { useHistory } from "@/components/use-history";
import { getRoom } from "@/lib/content/rooms";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { RadarChart } from "@/components/charts/radar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Button } from "@/components/ui/button";
import type { SessionResult } from "@/lib/game/types";

/**
 * Dimension model: each engine feeds one or more cognitive dimensions.
 * Values are normalized 0–100 from accuracy, speed, and consistency.
 */
const DIMENSION_SOURCES: Record<string, string[]> = {
  "Working Memory": ["span", "drm"],
  Attention: ["search", "flicker"],
  "Decision Making": ["framing", "conformity", "authority"],
  Learning: ["bandit"],
  Flexibility: ["stroop"],
  "Reaction Time": ["stroop", "search", "flicker", "bandit"],
};

function sessionValue(s: SessionResult): number {
  const speed = s.meanRtMs > 0 ? Math.max(0, 1 - s.meanRtMs / 3000) : 0.5;
  const consistency = Math.max(0, 1 - s.rtCvPct / 120);
  return Math.round((s.accuracy * 0.6 + speed * 0.25 + consistency * 0.15) * 100);
}

export function AnalyticsClient() {
  const sessions = useHistory();

  const { axes, timeline, byRoom } = useMemo(() => {
    const axes = Object.entries(DIMENSION_SOURCES).map(([label, engines]) => {
      const relevant = sessions.filter((s) => {
        const room = getRoom(s.roomSlug);
        return room && engines.includes(room.engine);
      });
      const value = relevant.length
        ? relevant.reduce((a, s) => a + sessionValue(s), 0) / relevant.length
        : 0;
      return { label, value, n: relevant.length };
    });

    const ordered = [...sessions].reverse();
    const timeline = ordered.map((s, i) => ({ x: i + 1, y: sessionValue(s) }));

    const roomAgg = new Map<string, { total: number; n: number }>();
    for (const s of sessions) {
      const cur = roomAgg.get(s.roomSlug) ?? { total: 0, n: 0 };
      roomAgg.set(s.roomSlug, { total: cur.total + sessionValue(s), n: cur.n + 1 });
    }
    const byRoom = [...roomAgg.entries()]
      .map(([slug, { total, n }]) => ({
        label: getRoom(slug)?.title ?? slug,
        value: Math.round(total / n),
      }))
      .sort((a, b) => b.value - a.value);

    return { axes, timeline, byRoom };
  }, [sessions]);

  const measured = axes.filter((a) => a.n > 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Longitudinal record"
        title="Cognitive Profile"
        description="Six dimensions, estimated from every trial you have run. Estimates sharpen as sessions accumulate, one session is an anecdote, twenty are a curve."
      />

      {sessions.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Activity strokeWidth={1.5} />}
            title="No measurements yet"
            description="Your profile is built from experiment sessions. Run two or three rooms across different wings to open the radar."
            action={
              <Button asChild size="sm">
                <Link href="/labs">Open the Lab Map</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-10 lg:grid-cols-[auto_1fr]">
            {/* Radar */}
            <section aria-labelledby="radar-h" className="mx-auto">
              <h2 id="radar-h" className="sr-only">
                Dimension radar
              </h2>
              <RadarChart
                axes={axes.map((a) => ({ label: a.label, value: a.value }))}
                size={380}
              />
            </section>

            {/* Dimension table */}
            <section aria-labelledby="dims-h" className="min-w-0">
              <h2 id="dims-h" className="label-micro mb-5 text-muted-foreground">
                Dimensions
              </h2>
              <ul className="divide-y divide-border border border-border">
                {axes.map((a) => (
                  <li key={a.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5">
                    <span className="text-sm">{a.label}</span>
                    <span className="font-mono text-[11px] text-faint">
                      {a.n} session{a.n === 1 ? "" : "s"}
                    </span>
                    <span className="w-12 text-right font-mono text-sm tabular">
                      {a.n > 0 ? Math.round(a.value) : "-"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Scores blend accuracy (60%), speed (25%), and response consistency
                (15%), normalized to 0–100. They are training estimates for
                reflection, not clinical measures.
              </p>
            </section>
          </div>

          {/* Longitudinal */}
          {timeline.length >= 3 ? (
            <section aria-labelledby="long-h" className="mt-16">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 id="long-h" className="text-lg font-medium tracking-tight">
                  Composite over time
                </h2>
                <span className="font-mono text-[11px] text-faint">
                  all {timeline.length} sessions
                </span>
              </div>
              <div className="border border-border p-4">
                <LineChart
                  series={[{ name: "Composite", points: timeline, accent: true }]}
                  height={220}
                  yTicks={(y) => `${Math.round(y)}`}
                  xTicks={(x) => `#${Math.round(x)}`}
                />
              </div>
            </section>
          ) : null}

          {/* Per-room */}
          {measured.length > 0 && byRoom.length > 0 ? (
            <section aria-labelledby="rooms-h" className="mt-16">
              <h2 id="rooms-h" className="mb-5 text-lg font-medium tracking-tight">
                Strength by room
              </h2>
              <div className="border border-border p-6">
                <BarChart
                  bars={byRoom.map((r, i) => ({ ...r, accent: i === 0 }))}
                  max={100}
                />
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
