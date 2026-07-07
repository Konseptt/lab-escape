"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lock, Check, Clock } from "lucide-react";
import { ROOMS, WINGS, DIFFICULTY_LABEL } from "@/lib/content/rooms";
import { useHistory } from "@/components/use-history";
import { PageHeader } from "@/components/page-header";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * The facility floor plan. Wings are corridors; rooms hang off them.
 * Drawn with borders and type, an architectural drawing, not a game map.
 */
export function LabMapClient() {
  const sessions = useHistory();
  const completed = useMemo(
    () => new Set(sessions.map((s) => s.roomSlug)),
    [sessions]
  );

  const isLocked = (slug: string) => {
    const room = ROOMS.find((r) => r.slug === slug)!;
    return Boolean(room.unlockAfter && !completed.has(room.unlockAfter));
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Facility schematic"
        title="Lab Map"
        description="Five wings, ten rooms. Sealed doors open when the preceding room in the wing is cleared."
      />

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center gap-6 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 bg-primary" aria-hidden="true" /> available
        </span>
        <span className="inline-flex items-center gap-2">
          <Check className="size-3 text-success" aria-hidden="true" /> cleared
        </span>
        <span className="inline-flex items-center gap-2">
          <Lock className="size-3 text-faint" aria-hidden="true" /> sealed
        </span>
      </div>

      <div className="relative mt-10">
        <div className="dot-grid absolute inset-0" aria-hidden="true" />
        <div className="relative space-y-0">
          {WINGS.map((wing, wi) => {
            const rooms = ROOMS.filter((r) => r.wing === wing.slug).sort(
              (a, b) => a.ordinal - b.ordinal
            );
            return (
              <motion.section
                key={wing.slug}
                aria-labelledby={`wing-${wing.slug}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: wi * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-[7rem_1fr] border border-border bg-background md:grid-cols-[11rem_1fr] [&+&]:border-t-0"
              >
                {/* Corridor label */}
                <div className="flex flex-col justify-between border-r border-border p-4 md:p-5">
                  <div>
                    <p className="font-mono text-[11px] text-faint">
                      WING {String.fromCharCode(65 + wi)}
                    </p>
                    <h2
                      id={`wing-${wing.slug}`}
                      className="mt-2 text-sm font-medium leading-snug tracking-tight"
                    >
                      {wing.name}
                    </h2>
                  </div>
                  <p className="mt-6 font-mono text-[11px] text-faint">
                    {rooms.filter((r) => completed.has(r.slug)).length}/{rooms.length}{" "}
                    cleared
                  </p>
                </div>

                {/* Rooms along the corridor */}
                <div className="flex items-stretch divide-x divide-border">
                  {rooms.map((room) => {
                    const locked = isLocked(room.slug);
                    const cleared = completed.has(room.slug);
                    const inner = (
                      <div
                        className={cn(
                          "group relative flex h-full min-h-36 flex-1 flex-col justify-between p-4 transition-colors md:p-5",
                          locked
                            ? "cursor-not-allowed"
                            : "hover:bg-muted"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-[11px] tracking-[0.14em] text-faint">
                            {room.code}
                          </span>
                          {locked ? (
                            <Lock className="size-3.5 text-faint" strokeWidth={1.75} />
                          ) : cleared ? (
                            <Check className="size-3.5 text-success" strokeWidth={2} />
                          ) : (
                            <span
                              className="mt-0.5 size-2 bg-primary"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className={locked ? "opacity-45" : undefined}>
                          <p className="text-sm font-medium leading-snug tracking-tight">
                            {room.title}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {room.domain}
                          </p>
                          <p className="mt-3 inline-flex items-center gap-3 font-mono text-[10px] text-faint">
                            <span>{DIFFICULTY_LABEL[room.difficulty].toUpperCase()}</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-2.5" aria-hidden="true" />
                              {room.durationMin}m
                            </span>
                          </p>
                        </div>
                      </div>
                    );

                    return locked ? (
                      <Tooltip key={room.slug}>
                        <TooltipTrigger asChild>
                          <div aria-disabled="true" className="flex-1">
                            {inner}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Clear {ROOMS.find((r) => r.slug === room.unlockAfter)?.title} first
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        key={room.slug}
                        href={`/experiments/${room.slug}`}
                        className="flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                        aria-label={`${room.code} ${room.title}, ${room.domain}${cleared ? ", cleared" : ""}`}
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
