import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { withFallback, db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { ROOMS } from "@/lib/content/rooms";
import { privatePageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { AdminTabs } from "./admin-tabs";

export const metadata: Metadata = privatePageMetadata("Admin");

export default async function AdminPage() {
  await requireRole("ADMIN");

  const [userCount, sessionCount, trialCount] = await Promise.all([
    withFallback(() => db.user.count(), 0),
    withFallback(() => db.gameSession.count(), 0),
    withFallback(() => db.trial.count(), 0),
  ]);
  const dbLive = await withFallback(
    () => db.$queryRaw`SELECT 1`.then(() => true),
    false
  );

  const leaderboard = await withFallback(
    () =>
      db.gameSession.findMany({
        where: { status: "COMPLETED", score: { not: null } },
        orderBy: { score: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, id: true } },
          room: { select: { title: true, code: true } },
        },
      }),
    []
  );

  const participantRows = await withFallback(
    () =>
      db.user.findMany({
        orderBy: [{ lastActiveAt: "desc" }, { createdAt: "desc" }],
        take: 100,
        include: {
          institution: { select: { name: true } },
          _count: { select: { gameSessions: true } },
        },
      }),
    []
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Operations console"
        title="Admin"
        description="Experiment configuration, participants, and facility telemetry."
        actions={
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Research Portal <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-px border-x border-b border-border bg-border md:grid-cols-4">
        <div className="bg-background p-6">
          <Stat
            label="Database"
            value={dbLive ? "Online" : "Offline"}
            hint={dbLive ? "postgres reachable" : "docker compose up -d"}
            accent={dbLive}
          />
        </div>
        <div className="bg-background p-6">
          <Stat label="Participants" value={userCount} />
        </div>
        <div className="bg-background p-6">
          <Stat label="Sessions recorded" value={sessionCount} />
        </div>
        <div className="bg-background p-6">
          <Stat label="Trials on file" value={trialCount} />
        </div>
      </div>

      <div className="mt-12">
        <AdminTabs
          rooms={ROOMS}
          dbLive={dbLive}
          leaderboard={leaderboard.map((s) => ({
            id: s.id,
            score: s.score ?? 0,
            accuracy: s.accuracy ?? 0,
            user: s.user.name ?? `P-${s.user.id.slice(-6).toUpperCase()}`,
            room: `${s.room.code} ${s.room.title}`,
          }))}
          participants={participantRows.map((u) => ({
            id: u.id,
            name: u.name ?? `P-${u.id.slice(-6).toUpperCase()}`,
            email: u.email,
            role: u.role,
            sessions: u._count.gameSessions,
            institution: u.institution?.name ?? null,
            lastActive: u.lastActiveAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </div>
  );
}
