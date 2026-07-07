import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/client";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { getRoom } from "@/lib/content/rooms";

const stimulusSchema = z
  .record(z.string(), z.unknown())
  .refine((s) => JSON.stringify(s).length <= 4096, "Stimulus payload too large");

const trialSchema = z.object({
  index: z.number().int().min(0).max(999),
  phase: z.enum(["practice", "main"]),
  stimulus: stimulusSchema,
  expected: z.string().max(256).nullable(),
  response: z.string().max(256).nullable(),
  correct: z.boolean().nullable(),
  rtMs: z.number().min(0).max(600_000).nullable(),
  shownAt: z.number().min(0).max(3_600_000),
});

const sessionSchema = z.object({
  id: z.string().regex(/^[a-z0-9_-]{8,64}$/i),
  roomSlug: z.string().max(64),
  seed: z.number().int().min(-2_147_483_648).max(2_147_483_647),
  startedAtISO: z.iso.datetime(),
  durationMs: z.number().min(0).max(3_600_000),
  trials: z.array(trialSchema).max(500),
  hintsUsed: z.number().int().min(0).max(50),
  score: z.number().min(0).max(10_000),
  accuracy: z.number().min(0).max(1),
  meanRtMs: z.number().min(0).max(600_000),
  rtCvPct: z.number().min(0).max(500),
});

/**
 * Persist a completed session. Guests get 204, their results live in
 * localStorage by design. Database being unreachable degrades the same way:
 * the client copy remains the source of truth.
 */
export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer || viewer.isGuest) {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = sessionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid session payload" }, { status: 400 });
  }
  const data = parsed.data;
  const content = getRoom(data.roomSlug);
  if (!content) {
    return NextResponse.json({ error: "Unknown room" }, { status: 400 });
  }

  try {
    const room = await db.room.findUnique({ where: { slug: data.roomSlug } });
    if (!room) return new NextResponse(null, { status: 204 });

    const startedAt = new Date(data.startedAtISO);
    const xpGain = Math.min(500, Math.max(0, Math.round(data.score / 10)));
    await db.$transaction(async (tx) => {
      await tx.gameSession.create({
        data: {
          id: data.id,
          userId: viewer.id,
          roomId: room.id,
          status: "COMPLETED",
          seed: data.seed,
          startedAt,
          completedAt: new Date(),
          durationMs: Math.round(data.durationMs),
          score: Math.round(Math.min(10_000, data.score)),
          accuracy: Math.min(1, Math.max(0, data.accuracy)),
          meanRtMs: Math.min(600_000, data.meanRtMs),
          rtCvPct: Math.min(500, data.rtCvPct),
          hintsUsed: Math.min(50, data.hintsUsed),
          trials: {
            create: data.trials.map((t) => ({
              index: t.index,
              phase: t.phase,
              stimulus: t.stimulus as object,
              expected: t.expected,
              response: t.response,
              correct: t.correct,
              rtMs: t.rtMs === null ? null : Math.round(t.rtMs),
              shownAt: new Date(startedAt.getTime() + t.shownAt),
            })),
          },
        },
      });
      await tx.user.update({
        where: { id: viewer.id },
        data: { xp: { increment: xpGain }, lastActiveAt: new Date() },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Duplicate session id: already persisted, do not award XP again.
      // Only the GameSession constraint counts — a Trial-level P2002
      // (duplicate trial index in the payload) is a real failure.
      if (err.code === "P2002") {
        // Trial's unique key is [sessionId, index] (duplicate trial index in
        // the payload = real failure); anything else is the session PK.
        const target = String(err.meta?.target ?? "");
        if (target.includes("sessionId")) {
          return NextResponse.json({ error: "Could not save session" }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
      }
      // P1xxx = connection-level. DB down, client copy is authoritative.
      if (err.code.startsWith("P1")) {
        return new NextResponse(null, { status: 204 });
      }
      return NextResponse.json({ error: "Could not save session" }, { status: 500 });
    }
    if (err instanceof Prisma.PrismaClientInitializationError) {
      // DB down, client copy is authoritative.
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json({ error: "Could not save session" }, { status: 500 });
  }
}

export async function GET() {
  const viewer = await getViewer();
  if (!viewer || viewer.isGuest) return NextResponse.json({ sessions: [] });
  try {
    const sessions = await db.gameSession.findMany({
      where: { userId: viewer.id },
      orderBy: { startedAt: "desc" },
      take: 50,
      include: { room: { select: { slug: true, title: true, code: true } } },
    });
    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ sessions: [] });
  }
}
