"use client";

import { useMemo } from "react";
import { Lock } from "lucide-react";
import { ACHIEVEMENTS, getRoom, ROOMS } from "@/lib/content/rooms";
import { useHistory } from "@/components/use-history";
import { PageHeader } from "@/components/page-header";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { cn } from "@/lib/utils";

/**
 * Client-side achievement evaluation over local history. The same criteria
 * run server-side for authenticated accounts; this keeps guests first-class.
 */
function useEarned(): Set<string> {
  const sessions = useHistory();
  return useMemo(() => {
    const earned = new Set<string>();
    const completed = new Set(sessions.map((s) => s.roomSlug));
    if (sessions.length > 0) earned.add("first-steps");

    const bySlug = (slug: string) => sessions.filter((s) => s.roomSlug === slug);

    if (bySlug("stroop-lock").some((s) => s.accuracy === 1)) earned.add("perfect-stroop");
    if (
      bySlug("magic-number-seven").some((s) =>
        s.highlights.some((h) => h.label === "Symbol span" && Number(h.value) >= 9)
      )
    )
      earned.add("span-nine");
    if (
      bySlug("invisible-gorilla").some((s) =>
        s.highlights.some((h) => h.value === "Noticed")
      )
    )
      earned.add("saw-gorilla");
    if (
      bySlug("conformity-chamber").some((s) =>
        s.highlights.some((h) => h.label.startsWith("Yielded") && h.value.startsWith("0"))
      )
    )
      earned.add("unmoved");
    if (
      bySlug("authority-protocol").some((s) =>
        s.highlights.some((h) => {
          const m = h.value.match(/Checkpoint (\d+)/);
          return m && Number(m[1]) < 5;
        })
      )
    )
      earned.add("early-refusal");
    if (
      bySlug("framing-effect").some((s) =>
        s.highlights.some((h) => h.label === "Preference reversals" && h.value.startsWith("0"))
      )
    )
      earned.add("frame-proof");
    if (
      bySlug("reward-corridor").some((s) =>
        s.highlights.some(
          (h) => h.label.startsWith("Trials to adapt") && Number(h.value) <= 8
        )
      )
    )
      earned.add("fast-adapt");
    if (
      bySlug("false-memory").some((s) =>
        s.highlights.some((h) => {
          const m = h.value.match(/^(\d+) \/ (\d+)$/);
          return m && m[1] === m[2];
        })
      )
    )
      earned.add("skeptic");

    const attentionRooms = ROOMS.filter((r) => r.wing === "attention");
    if (attentionRooms.every((r) => completed.has(r.slug))) earned.add("wing-attention");
    if (ROOMS.every((r) => completed.has(r.slug))) earned.add("all-rooms");

    const dayEpochs = Array.from(
      new Set(
        sessions.map((s) => {
          const d = new Date(s.startedAtISO);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        })
      )
    ).sort((a, b) => a - b);
    let run = dayEpochs.length ? 1 : 0;
    let bestRun = run;
    for (let i = 1; i < dayEpochs.length; i++) {
      // Round: DST shifts make local midnights 23-25h apart.
      const gapDays = Math.round((dayEpochs[i] - dayEpochs[i - 1]) / 86_400_000);
      run = gapDays === 1 ? run + 1 : 1;
      if (run > bestRun) bestRun = run;
    }
    if (bestRun >= 7) earned.add("week-streak");

    return earned;
  }, [sessions]);
}

export function AchievementsClient() {
  const earned = useEarned();
  const visible = ACHIEVEMENTS.filter((a) => !a.secret || earned.has(a.slug));
  const secretsHidden = ACHIEVEMENTS.length - visible.length;
  const earnedXp = ACHIEVEMENTS.filter((a) => earned.has(a.slug)).reduce(
    (sum, a) => sum + a.xpReward,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow={`${earned.size} of ${ACHIEVEMENTS.length} earned · ${earnedXp} XP`}
        title="Achievements"
        description="Records of notable performances. Some are earned by resisting the experiment rather than beating it."
      />

      <RevealGroup className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((a) => {
          const has = earned.has(a.slug);
          const room = a.roomSlug ? getRoom(a.roomSlug) : null;
          return (
            <RevealItem
              key={a.slug}
              className={cn("flex flex-col bg-background p-6", !has && "opacity-60")}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "label-micro",
                    has ? "text-primary" : "text-faint"
                  )}
                >
                  {has ? "Earned" : "Unearned"}
                </span>
                <span className="font-mono text-[11px] text-faint">
                  +{a.xpReward} XP
                </span>
              </div>
              <h2 className="mt-4 text-lg font-medium tracking-tight">{a.title}</h2>
              <p className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {a.description}
              </p>
              {room ? (
                <p className="mt-4 border-t border-border pt-3 font-mono text-[11px] text-faint">
                  {room.code} · {room.title}
                </p>
              ) : (
                <p className="mt-4 border-t border-border pt-3 font-mono text-[11px] text-faint">
                  Facility-wide
                </p>
              )}
            </RevealItem>
          );
        })}
        {secretsHidden > 0 ? (
          <RevealItem className="flex flex-col items-center justify-center gap-3 bg-background p-6 text-center">
            <Lock className="size-4 text-faint" strokeWidth={1.5} aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              {secretsHidden} sealed record{secretsHidden === 1 ? "" : "s"}
            </p>
            <p className="text-[11px] leading-relaxed text-faint">
              Some achievements only reveal themselves when earned.
            </p>
          </RevealItem>
        ) : null}
      </RevealGroup>
    </div>
  );
}
