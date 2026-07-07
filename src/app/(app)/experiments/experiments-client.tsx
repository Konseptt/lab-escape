"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useHistory } from "@/components/use-history";
import { ROOMS, WINGS } from "@/lib/content/rooms";
import { PageHeader } from "@/components/page-header";
import { RoomCard } from "@/components/room-card";
import { NextActionBar } from "@/components/ux/next-action-bar";
import { useNextAction } from "@/components/ux/use-next-action";

const START_HERE = "invisible-gorilla";

export function ExperimentsClient() {
  const sessions = useHistory();
  const completed = useMemo(
    () => new Set(sessions.map((s) => s.roomSlug)),
    [sessions]
  );

  const nextAction = useNextAction();
  const startRoom = ROOMS.find((r) => r.slug === START_HERE)!;

  const isLocked = (slug: string) => {
    const room = ROOMS.find((r) => r.slug === slug)!;
    return Boolean(room.unlockAfter && !completed.has(room.unlockAfter));
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Protocol catalog"
        title="Experiments"
        description="Ten paradigms in wing order. New here? Start with A-01. Each room follows briefing, session, debrief, literature."
      />

      <NextActionBar action={nextAction} className="mt-8" />

      {sessions.length === 0 ? (
        <section
          aria-labelledby="start-h"
          className="fiducial mt-10 border border-border bg-surface p-6"
        >
          <p className="label-micro text-primary">Start here</p>
          <h2 id="start-h" className="mt-2 text-lg font-medium tracking-tight">
            {startRoom.code} · {startRoom.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {startRoom.summary} About {startRoom.durationMin} minutes. No account
            required.
          </p>
          <Link
            href={`/experiments/${START_HERE}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Open briefing <ArrowRight className="size-3.5" />
          </Link>
        </section>
      ) : null}

      <div className="mt-12 space-y-16">
        {WINGS.map((wing) => {
          const rooms = ROOMS.filter((r) => r.wing === wing.slug);
          return (
            <section key={wing.slug} aria-labelledby={`h-${wing.slug}`}>
              <div className="mb-6 flex items-baseline gap-4">
                <h2
                  id={`h-${wing.slug}`}
                  className="text-xl font-medium tracking-tight"
                >
                  {wing.name}
                </h2>
                <span className="font-mono text-[11px] text-faint">
                  {rooms.filter((r) => completed.has(r.slug)).length}/{rooms.length}{" "}
                  cleared
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.slug}
                    room={room}
                    locked={isLocked(room.slug)}
                    completed={completed.has(room.slug)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
