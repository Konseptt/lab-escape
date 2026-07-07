"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Download } from "lucide-react";
import { useHistory } from "@/components/use-history";
import { getRoom, ROOMS, ACHIEVEMENTS } from "@/lib/content/rooms";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProfileClient({
  name,
  email,
  isGuest,
}: {
  name: string;
  email: string | null | undefined;
  isGuest: boolean;
}) {
  const sessions = useHistory();

  const { xp, level, favorite, totalMin } = useMemo(() => {
    const xp = sessions.reduce((a, s) => a + Math.round(s.score / 10), 0);
    const level = 1 + Math.floor(xp / 250);
    const counts = new Map<string, number>();
    for (const s of sessions)
      counts.set(s.roomSlug, (counts.get(s.roomSlug) ?? 0) + 1);
    const favSlug = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      xp,
      level,
      favorite: favSlug ? getRoom(favSlug) : null,
      totalMin: Math.round(sessions.reduce((a, s) => a + s.durationMs, 0) / 60000),
    };
  }, [sessions]);

  const downloadLocal = () => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lab-escape-sessions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Subject file"
        title={name}
        description={
          isGuest
            ? "Guest session, data lives in this browser. Create an account to sync across devices."
            : (email ?? undefined)
        }
        actions={
          <Button variant="secondary" onClick={downloadLocal} disabled={sessions.length === 0}>
            <Download className="size-4" /> Export my data
          </Button>
        }
      />

      {/* Identity block */}
      <div className="grid grid-cols-2 gap-px border-x border-b border-border bg-border md:grid-cols-4">
        <div className="bg-background p-6">
          <Stat label="Level" value={level} accent />
        </div>
        <div className="bg-background p-6">
          <Stat label="XP" value={xp} />
        </div>
        <div className="bg-background p-6">
          <Stat
            label="Rooms cleared"
            value={new Set(sessions.map((s) => s.roomSlug)).size}
            unit={`/ ${ROOMS.length}`}
          />
        </div>
        <div className="bg-background p-6">
          <Stat label="Time measured" value={totalMin} unit="min" />
        </div>
      </div>

      {favorite ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Most-run room:{" "}
          <Link
            href={`/experiments/${favorite.slug}`}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            {favorite.title}
          </Link>
        </p>
      ) : null}

      {/* History table */}
      <section aria-labelledby="history-h" className="mt-14">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 id="history-h" className="text-xl font-medium tracking-tight">
            Session history
          </h2>
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Achievements <ArrowRight className="size-3" />
          </Link>
        </div>
        {sessions.length === 0 ? (
          <EmptyState
            title="Nothing on file"
            description="Sessions you complete will be listed here with full trial data."
            action={
              <Button asChild size="sm">
                <Link href="/experiments">Browse experiments</Link>
              </Button>
            }
          />
        ) : (
          <div className="border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="label-micro">Room</TableHead>
                  <TableHead className="label-micro">Date</TableHead>
                  <TableHead className="label-micro text-right">Accuracy</TableHead>
                  <TableHead className="label-micro text-right">Mean RT</TableHead>
                  <TableHead className="label-micro text-right">Score</TableHead>
                  <TableHead className="label-micro text-right">Trials</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => {
                  const room = getRoom(s.roomSlug);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Link
                          href={`/results/${s.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {room?.title ?? s.roomSlug}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(s.startedAtISO).toLocaleDateString(undefined, {
                          year: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular">
                        {Math.round(s.accuracy * 100)}%
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular">
                        {s.meanRtMs > 0 ? `${Math.round(s.meanRtMs)}ms` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular text-primary">
                        {s.score}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular text-muted-foreground">
                        {s.trials.length}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <p className="mt-10 font-mono text-[11px] leading-relaxed text-faint">
        {ACHIEVEMENTS.length} achievements defined · settings and privacy controls
        live under{" "}
        <Link href="/settings" className="underline underline-offset-2 hover:text-foreground">
          Settings
        </Link>
        .
      </p>
    </div>
  );
}
