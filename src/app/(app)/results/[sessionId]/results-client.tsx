"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, animate } from "framer-motion";
import { ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import { useHistory } from "@/components/use-history";
import { getRoom } from "@/lib/content/rooms";
import { learningCurve } from "@/lib/game/scoring";
import { SubjectPathway } from "@/components/subject-pathway";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { LineChart } from "@/components/charts/line-chart";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SessionDebrief } from "@/components/training/session-debrief";
import { NextActionBar } from "@/components/ux/next-action-bar";
import { useNextAction } from "@/components/ux/use-next-action";
import { UxMilestone } from "@/components/ux/ux-milestone";
import { trainingStats } from "@/lib/training/plan";
import { cn } from "@/lib/utils";

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, reduce]);
  if (reduce) return <>{value.toFixed(decimals)}</>;
  return <>{display.toFixed(decimals)}</>;
}

export function ResultsClient({ sessionId }: { sessionId: string }) {
  const sessions = useHistory();
  const nextAction = useNextAction();
  const session = sessions.find((s) => s.id === sessionId);
  const room = session ? getRoom(session.roomSlug) : null;

  const curve = useMemo(
    () => (session ? learningCurve(session.trials) : []),
    [session]
  );
  const rtSeries = useMemo(() => {
    if (!session) return [];
    return session.trials
      .filter((t) => t.phase === "main" && t.rtMs !== null)
      .map((t, i) => ({ x: i + 1, y: t.rtMs as number }));
  }, [session]);

  if (!session || !room) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
        <EmptyState
          title="Session not found"
          description="This session isn't in your local history. It may belong to another device or browser profile."
          action={
            <Button asChild size="sm">
              <Link href="/labs">Back to Lab Map</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const errors = session.trials.filter(
    (t) => t.phase === "main" && t.correct === false
  ).length;
  const minutes = Math.floor(session.durationMs / 60000);
  const seconds = Math.round((session.durationMs % 60000) / 1000);
  const { priorInRoom, bestScoreInRoom, streakDays } = trainingStats(sessions);
  const roomPrior = priorInRoom(session.roomSlug);
  const roomBest = bestScoreInRoom(session.roomSlug);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      <UxMilestone type="debrief" id={session.id} />
      <PageHeader
        eyebrow={`Debrief · ${room.code} · seed ${session.seed}`}
        title="Rep logged."
        description={`${room.title}, ${new Date(session.startedAtISO).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}.`}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/play/${room.slug}`}>
                <RotateCcw className="size-4" /> Run again
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/science/${room.slug}`}>
                The science <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <SubjectPathway
        current="debrief"
        roomSlug={room.slug}
        sessionId={session.id}
        className="mt-8"
      />

      {/* Primary numerals */}
      <div className="grid grid-cols-2 gap-px border-x border-b border-border bg-border md:grid-cols-4">
        <div className="bg-background p-6">
          <p className="label-micro text-muted-foreground">Score</p>
          <p className="mt-2 font-mono text-4xl tabular tracking-tight text-primary">
            <AnimatedNumber value={session.score} />
          </p>
          <p className="mt-1 text-xs text-faint">of 1000</p>
        </div>
        <div className="bg-background p-6">
          <p className="label-micro text-muted-foreground">Accuracy</p>
          <p className="mt-2 font-mono text-4xl tabular tracking-tight">
            <AnimatedNumber value={session.accuracy * 100} />
            <span className="text-lg text-muted-foreground">%</span>
          </p>
          <p className="mt-1 text-xs text-faint">{errors} errors</p>
        </div>
        <div className="bg-background p-6">
          <p className="label-micro text-muted-foreground">Median pace</p>
          <p className="mt-2 font-mono text-4xl tabular tracking-tight">
            <AnimatedNumber value={session.meanRtMs} />
            <span className="text-lg text-muted-foreground">ms</span>
          </p>
          <p className="mt-1 text-xs text-faint">mean correct RT</p>
        </div>
        <div className="bg-background p-6">
          <p className="label-micro text-muted-foreground">Consistency</p>
          <p className="mt-2 font-mono text-4xl tabular tracking-tight">
            <AnimatedNumber value={session.rtCvPct} decimals={1} />
            <span className="text-lg text-muted-foreground">%</span>
          </p>
          <p className="mt-1 text-xs text-faint">RT variability (lower is steadier)</p>
        </div>
      </div>

      {/* Paradigm-specific highlights */}
      {session.highlights.length > 0 ? (
        <div className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-2">
          {session.highlights.map((h) => (
            <div key={h.label} className="fiducial bg-background p-6 text-foreground">
              <p className="label-micro text-primary">{h.label}</p>
              <p className="mt-2 text-2xl font-medium tracking-tight">{h.value}</p>
              {h.hint ? (
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {h.hint}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-14 grid gap-14 lg:grid-cols-2">
        {/* Reaction time over the session */}
        {rtSeries.length >= 4 ? (
          <section aria-labelledby="rt-h">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="rt-h" className="text-lg font-medium tracking-tight">
                Reaction time across the session
              </h2>
              <span className="font-mono text-[11px] text-faint">ms / trial</span>
            </div>
            <div className="border border-border p-4">
              <LineChart
                series={[{ name: "RT", points: rtSeries, accent: true }]}
                height={200}
                yTicks={(y) => `${Math.round(y)}`}
                xTicks={(x) => `${Math.round(x)}`}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              A rising tail often marks fatigue; a falling curve, learning. Spikes
              are lapses, moments where attention let go of the task.
            </p>
          </section>
        ) : null}

        {/* Learning curve */}
        {curve.length >= 3 ? (
          <section aria-labelledby="curve-h">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="curve-h" className="text-lg font-medium tracking-tight">
                Learning curve
              </h2>
              <span className="font-mono text-[11px] text-faint">accuracy / fifth</span>
            </div>
            <div className="border border-border p-4">
              <LineChart
                series={[
                  {
                    name: "Accuracy",
                    points: curve.map((c) => ({ x: c.bucket, y: c.accuracy * 100 })),
                    accent: true,
                  },
                ]}
                height={200}
                yTicks={(y) => `${Math.round(y)}%`}
                xTicks={(x) => `⅕×${Math.round(x)}`}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              The session split into fifths. Flat and high means the task was
              within capacity; climbing means the room taught you something.
            </p>
          </section>
        ) : null}
      </div>

      {/* Trial timeline replay */}
      <section aria-labelledby="timeline-h" className="mt-14">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="timeline-h" className="text-lg font-medium tracking-tight">
            Trial timeline
          </h2>
          <span className="font-mono text-[11px] text-faint">
            {session.trials.length} trials · {minutes}m {seconds}s
          </span>
        </div>
        <div className="flex flex-wrap gap-1 border border-border p-4">
          {session.trials.map((t) => (
            <Tooltip key={t.index}>
              <TooltipTrigger asChild>
                <motion.span
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: Math.min(t.index * 0.012, 1), duration: 0.25 }}
                  className={cn(
                    "h-8 w-2 origin-bottom cursor-default",
                    t.phase === "practice"
                      ? "bg-border"
                      : t.correct === null
                        ? "bg-faint"
                        : t.correct
                          ? "bg-primary"
                          : "bg-destructive"
                  )}
                  aria-label={`Trial ${t.index + 1}: ${
                    t.phase === "practice"
                      ? "practice"
                      : t.correct === null
                        ? "unscored"
                        : t.correct
                          ? "correct"
                          : "error"
                  }${t.rtMs !== null ? `, ${t.rtMs} ms` : ""}`}
                />
              </TooltipTrigger>
              <TooltipContent className="font-mono text-[11px]">
                #{t.index + 1} · {t.phase}
                {t.rtMs !== null ? ` · ${t.rtMs}ms` : ""}
                {t.correct !== null ? (t.correct ? " · ✓" : " · ✗") : ""}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="mt-3 flex gap-6 font-mono text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 bg-primary" aria-hidden="true" /> correct
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 bg-destructive" aria-hidden="true" /> error
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 bg-border" aria-hidden="true" /> practice
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 bg-faint" aria-hidden="true" /> unscored
          </span>
        </div>
      </section>

      <SessionDebrief
        session={session}
        room={room}
        priorInRoom={roomPrior}
        bestScoreInRoom={roomBest}
        streakDays={streakDays}
      />

      {/* Handoff to science */}
      <section className="fiducial mt-14 border border-border p-8 text-foreground">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="label-micro text-primary">Debrief</p>
            <h2 className="mt-2 text-2xl font-medium tracking-tight">
              What just happened to you?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {room.whatHappened}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href={`/science/${room.slug}`}>
              <BookOpen className="size-4" /> Read the science
            </Link>
          </Button>
        </div>
      </section>

      <NextActionBar action={nextAction} className="mt-8" />
    </div>
  );
}
