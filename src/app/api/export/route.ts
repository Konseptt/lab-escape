import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";

const CSV_HEADER = [
  "session_id", "participant", "room", "seed", "trial_index", "phase",
  "stimulus", "expected", "response", "correct", "rt_ms", "shown_at_ms",
].join(",");

function csvEscape(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  // Neutralize spreadsheet formula injection (=, +, -, @, tab, CR).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Research export: trial-level data for the requesting user's sessions
 * (or all sessions for ADMIN/RESEARCHER). `?format=json|csv`.
 * Staff bulk exports are anonymized by default; pass `?identified=1` to include emails.
 * Personal exports include identity unless `?anonymize=1`.
 * `shown_at_ms` is the trial onset as milliseconds since session start.
 */
export async function GET(req: Request) {
  const viewer = await getViewer();
  if (!viewer || viewer.isGuest) {
    return NextResponse.json(
      { error: "Sign in to export research data." },
      { status: 401 }
    );
  }
  const url = new URL(req.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
  const isStaff = viewer.role === "ADMIN" || viewer.role === "RESEARCHER";
  const identified = url.searchParams.get("identified") === "1";
  const anonymize = isStaff
    ? !identified
    : url.searchParams.get("anonymize") === "1";

  try {
    const sessions = await db.gameSession.findMany({
      where: isStaff ? {} : { userId: viewer.id },
      include: {
        trials: { orderBy: { index: "asc" } },
        room: { select: { slug: true } },
        user: { select: { id: true, email: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 500,
    });

    const participant = (userId: string, email: string | null) =>
      anonymize
        ? `P-${userId.slice(-6).toUpperCase()}`
        : (email ?? userId);

    if (format === "json") {
      const payload = sessions.map((s) => ({
        sessionId: s.id,
        participant: participant(s.user.id, s.user.email),
        room: s.room.slug,
        seed: s.seed,
        startedAt: s.startedAt,
        durationMs: s.durationMs,
        accuracy: s.accuracy,
        meanRtMs: s.meanRtMs,
        rtCvPct: s.rtCvPct,
        hintsUsed: s.hintsUsed,
        trials: s.trials,
      }));
      return NextResponse.json({ exportedAt: new Date().toISOString(), sessions: payload });
    }

    const rows = [CSV_HEADER];
    for (const s of sessions) {
      for (const t of s.trials) {
        rows.push(
          [
            s.id,
            participant(s.user.id, s.user.email),
            s.room.slug,
            s.seed,
            t.index,
            t.phase,
            JSON.stringify(t.stimulus),
            t.expected,
            t.response,
            t.correct,
            t.rtMs,
            t.shownAt.getTime() - s.startedAt.getTime(),
          ]
            .map(csvEscape)
            .join(",")
        );
      }
    }
    return new NextResponse(rows.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="lab-escape-export-${Date.now()}.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 }
    );
  }
}
