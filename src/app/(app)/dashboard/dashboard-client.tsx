"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, FlaskConical } from "lucide-react";
import { useHistory } from "@/components/use-history";
import { ROOMS, getRoom } from "@/lib/content/rooms";
import { SubjectPathway } from "@/components/subject-pathway";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { RoomCard } from "@/components/room-card";
import { EmptyState } from "@/components/empty-state";
import { Sparkline } from "@/components/charts/sparkline";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { buildTrainingPlan } from "@/lib/training/plan";
import { NextActionBar } from "@/components/ux/next-action-bar";
import { useNextAction } from "@/components/ux/use-next-action";
import { TrainingChecklist } from "@/components/ux/training-checklist";
import { GuestNotice } from "@/components/ux/guest-notice";

const TRAINING_DRILLS = [
  {
    tag: "Attention",
    title: "Run A-01 twice in one day. Track whether gorilla detection improves on rep 2.",
    source: "Self-training · selective attention",
  },
  {
    tag: "Executive",
    title: "Stroop D-01: aim for interference cost under 120ms before moving to D-02.",
    source: "Skill gate · executive control",
  },
  {
    tag: "Social",
    title: "E-01 with ally trial: note yield rate when one panelist dissents.",
    source: "Protocol variation · conformity",
  },
];

export function DashboardClient({ name, isGuest = true }: { name: string; isGuest?: boolean }) {
  const sessions = useHistory();
  // Daily challenge: deterministic pick by date, fixed at mount.
  const [dayIdx] = useState(() => Math.floor(Date.now() / 86_400_000) % ROOMS.length);

  const { completed, totalMinutes, meanAccuracy, xp, recentScores, suggestion, daily } =
    useMemo(() => {
      const completedSlugs = new Set(sessions.map((s) => s.roomSlug));
      const totalMs = sessions.reduce((a, s) => a + s.durationMs, 0);
      const acc = sessions.length
        ? sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length
        : 0;
      const xp = sessions.reduce((a, s) => a + Math.round(s.score / 10), 0);
      const unlocked = ROOMS.filter(
        (r) => !r.unlockAfter || completedSlugs.has(r.unlockAfter)
      );
      const next =
        unlocked.find((r) => !completedSlugs.has(r.slug)) ?? ROOMS[0];
      return {
        completed: completedSlugs,
        totalMinutes: Math.round(totalMs / 60_000),
        meanAccuracy: acc,
        xp,
        recentScores: sessions.slice(0, 12).map((s) => s.score).reverse(),
        suggestion: next,
        daily: ROOMS[dayIdx],
      };
    }, [sessions, dayIdx]);

  const lastSession = sessions[0];
  const lastRoom = lastSession ? getRoom(lastSession.roomSlug) : null;
  const plan = useMemo(() => buildTrainingPlan(sessions), [sessions]);
  const nextAction = useNextAction();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <GuestNotice isGuest={isGuest} />

      <PageHeader
        eyebrow="Personal training log"
        title={sessions.length ? `Rep log · ${name.split(" ")[0]}` : `Train · ${name.split(" ")[0]}`}
        description={
          sessions.length
            ? "Measurable skill across ten paradigms. Each debrief includes session notes on what to drill next."
            : "Ten rooms, trial-level feedback, debrief after every rep. Start with the gorilla room: about eight minutes to a baseline."
        }
        actions={
          <Button asChild>
            <Link href={`/experiments/${plan.focusRoomSlug}`}>
              {sessions.length ? "Today's focus" : "First rep"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-6">
        <NextActionBar action={nextAction} />
        <TrainingChecklist />
      </div>

      <SubjectPathway
        current={nextAction.step}
        roomSlug={lastSession?.roomSlug ?? suggestion.slug}
        sessionId={lastSession?.id}
        className="mt-8"
      />

      {/* Vitals strip */}
      <RevealGroup className="grid grid-cols-2 gap-px border-x border-b border-border bg-border md:grid-cols-5">
        <RevealItem className="bg-background p-6">
          <Stat label="Rooms cleared" value={completed.size} unit={`/ ${ROOMS.length}`} accent />
        </RevealItem>
        <RevealItem className="bg-background p-6">
          <Stat label="Sessions" value={sessions.length} />
        </RevealItem>
        <RevealItem className="bg-background p-6">
          <Stat
            label="Mean accuracy"
            value={sessions.length ? `${Math.round(meanAccuracy * 100)}` : "-"}
            unit={sessions.length ? "%" : undefined}
          />
        </RevealItem>
        <RevealItem className="bg-background p-6">
          <Stat label="Time in rooms" value={totalMinutes} unit="min" />
        </RevealItem>
        <RevealItem className="bg-background p-6">
          <span className="label-micro text-muted-foreground">Score trend</span>
          <div className="mt-2.5">
            {recentScores.length >= 2 ? (
              <Sparkline values={recentScores} accent width={140} height={32} />
            ) : (
              <span className="font-mono text-sm text-faint">insufficient data</span>
            )}
          </div>
          <span className="mt-1 block text-xs text-faint">last 12 sessions</span>
        </RevealItem>
      </RevealGroup>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-12">
          {/* Continue / recent */}
          <section aria-labelledby="recent-h">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 id="recent-h" className="text-xl font-medium tracking-tight">
                Recent sessions
              </h2>
              <Link
                href="/profile"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Full history
              </Link>
            </div>
            {sessions.length === 0 ? (
              <EmptyState
                icon={<FlaskConical strokeWidth={1.5} />}
                title="No sessions recorded"
                description="Your trial-level data will appear here after your first experiment. Start with the Invisible Gorilla, it takes eight minutes."
                action={
                  <Button asChild size="sm">
                    <Link href="/experiments/invisible-gorilla">Enter Room A-01</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border border border-border">
                {sessions.slice(0, 5).map((s) => {
                  const room = getRoom(s.roomSlug);
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/results/${s.id}`}
                        className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-6 px-5 py-4 transition-colors hover:bg-muted"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {room?.title ?? s.roomSlug}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-faint">
                            {new Date(s.startedAtISO).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            · seed {s.seed}
                          </p>
                        </div>
                        <span className="font-mono text-sm tabular text-muted-foreground">
                          {Math.round(s.accuracy * 100)}%
                        </span>
                        <span className="font-mono text-sm tabular text-foreground">
                          {s.score}
                        </span>
                        <ArrowRight className="size-3.5 text-faint" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Suggested */}
          <section aria-labelledby="suggested-h">
            <h2 id="suggested-h" className="mb-5 text-xl font-medium tracking-tight">
              Suggested next
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <RoomCard room={suggestion} />
              {lastRoom && lastRoom.slug !== suggestion.slug ? (
                <RoomCard room={lastRoom} completed={completed.has(lastRoom.slug)} />
              ) : (
                <RoomCard
                  room={ROOMS.find((r) => r.slug !== suggestion.slug && !completed.has(r.slug)) ?? ROOMS[1]}
                />
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-12">
          {/* Progress */}
          <section aria-labelledby="progress-h">
            <h2 id="progress-h" className="mb-5 text-xl font-medium tracking-tight">
              Clearance
            </h2>
            <div className="border border-border p-5">
              <div className="flex items-baseline justify-between">
                <span className="label-micro text-muted-foreground">Facility</span>
                <span className="font-mono text-sm tabular">
                  {Math.round((completed.size / ROOMS.length) * 100)}%
                </span>
              </div>
              <Progress
                value={(completed.size / ROOMS.length) * 100}
                className="mt-3 h-1 rounded-none bg-muted [&>[data-slot=progress-indicator]]:bg-primary"
              />
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {xp} XP accumulated. {ROOMS.length - completed.size} rooms remain sealed
                or uncleared.
              </p>
            </div>
          </section>

          {/* Daily challenge */}
          <section aria-labelledby="daily-h">
            <h2 id="daily-h" className="mb-5 text-xl font-medium tracking-tight">
              Daily calibration
            </h2>
            <div className="fiducial border border-border p-5 text-foreground">
              <p className="label-micro text-primary">Today</p>
              <p className="mt-2 text-sm font-medium">{daily.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Beat your best score in {daily.domain.toLowerCase()}, repeat sessions
                sharpen the longitudinal curve.
              </p>
              <Button asChild size="sm" variant="secondary" className="mt-4">
                <Link href={`/play/${daily.slug}`}>Run calibration</Link>
              </Button>
            </div>
          </section>

          {/* Training drills */}
          <section aria-labelledby="drills-h">
            <h2 id="drills-h" className="mb-5 text-xl font-medium tracking-tight">
              Drill queue
            </h2>
            <ul className="space-y-4">
              {TRAINING_DRILLS.map((n) => (
                <li key={n.title} className="border-l border-border pl-4">
                  <p className="label-micro text-faint">{n.tag}</p>
                  <p className="mt-1 text-sm leading-snug">{n.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.source}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
