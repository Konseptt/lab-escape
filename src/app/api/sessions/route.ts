import { NextResponse } from "next/server";
import { z } from "zod";
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
  shownAt: z.number(),
});

const sessionSchema = z.object({
  id: z.string().max(64),
  roomSlug: z.string().max(64),
  seed: z.number().int(),
  startedAtISO: z.string(),
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

    await db.gameSession.create({
      data: {
        userId: viewer.id,
        roomId: room.id,
        status: "COMPLETED",
        seed: data.seed,
        startedAt: new Date(data.startedAtISO),
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
          })),
        },
      },
    });
    const xpGain = Math.min(500, Math.max(0, Math.round(data.score / 10)));
    await db.user.update({
      where: { id: viewer.id },
      data: { xp: { increment: xpGain }, lastActiveAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch {
    // DB down, client copy is authoritative.
    return new NextResponse(null, { status: 204 });
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
