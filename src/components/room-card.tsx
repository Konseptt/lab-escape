import Link from "next/link";
import { Lock, Clock } from "lucide-react";
import type { RoomContent } from "@/lib/content/types";
import { DIFFICULTY_LABEL } from "@/lib/content/rooms";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  room: RoomContent;
  locked?: boolean;
  completed?: boolean;
  className?: string;
}

export function DifficultyMeter({ level }: { level: string }) {
  const n = level === "INTRO" ? 1 : level === "STANDARD" ? 2 : 3;
  return (
    <span
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={`Difficulty: ${DIFFICULTY_LABEL[level]}`}
    >
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            "h-2.5 w-[3px]",
            i <= n ? "bg-foreground" : "bg-border"
          )}
        />
      ))}
      <span className="ml-1 text-[11px] text-muted-foreground">
        {DIFFICULTY_LABEL[level]}
      </span>
    </span>
  );
}

export function RoomCard({ room, locked, completed, className }: RoomCardProps) {
  const inner = (
    <article
      className={cn(
        "group relative flex h-full flex-col border border-border bg-surface p-5 transition-[border-color,background-color]",
        locked ? "opacity-55" : "hover:border-l-[3px] hover:border-l-primary hover:pl-[calc(1.25rem-2px)]",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="font-mono text-[11px] tracking-[0.14em] text-faint">
          {room.code}
        </span>
        {locked ? (
          <Lock className="size-3.5 text-faint" strokeWidth={1.75} aria-hidden="true" />
        ) : completed ? (
          <span className="label-micro text-success">Cleared</span>
        ) : null}
      </div>
      <p className="label-micro mb-1.5 text-faint">{room.domain}</p>
      <h3 className="text-lg font-medium leading-snug tracking-tight">
        {room.title}
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
        {room.summary}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-3.5">
        <DifficultyMeter level={room.difficulty} />
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="size-3" strokeWidth={1.75} aria-hidden="true" />
          {room.durationMin} min
        </span>
      </div>
    </article>
  );

  if (locked) {
    return (
      <div aria-disabled="true" aria-label={`${room.title} locked`}>
        {inner}
      </div>
    );
  }
  return (
    <Link
      href={`/experiments/${room.slug}`}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
    >
      {inner}
    </Link>
  );
}
