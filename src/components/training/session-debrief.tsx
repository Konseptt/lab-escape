"use client";

import type { RoomContent } from "@/lib/content/types";
import type { SessionResult } from "@/lib/game/types";
import { buildSessionDebrief } from "@/lib/training/debrief";

export function SessionDebrief({
  session,
  room,
  priorInRoom,
  bestScoreInRoom,
  streakDays,
}: {
  session: SessionResult;
  room: RoomContent;
  priorInRoom: number;
  bestScoreInRoom: number | null;
  streakDays: number;
}) {
  const debrief = buildSessionDebrief(
    room,
    session,
    priorInRoom,
    bestScoreInRoom,
    streakDays
  );

  return (
    <section
      aria-labelledby="debrief-notes-h"
      className="fiducial mt-14 border border-border bg-surface"
    >
      <div className="border-b border-border px-6 py-4">
        <p className="label-micro text-faint">Session notes</p>
        <h2 id="debrief-notes-h" className="mt-1 text-lg font-medium tracking-tight">
          What to work on next
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{debrief.progress}</p>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div>
          <h3 className="text-sm font-medium tracking-tight">This rep</h3>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {debrief.summary}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium tracking-tight">Pattern</h3>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {debrief.pattern}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium tracking-tight">Next rep</h3>
          <ol className="mt-3 space-y-2">
            {debrief.drills.map((drill, i) => (
              <li
                key={drill}
                className="flex gap-2 text-[0.8125rem] leading-relaxed text-muted-foreground"
              >
                <span className="font-mono text-[11px] text-primary">{i + 1}</span>
                <span>{drill}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
