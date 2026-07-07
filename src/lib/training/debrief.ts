import type { RoomContent } from "@/lib/content/types";
import type { SessionResult } from "@/lib/game/types";

export interface SessionDebrief {
  summary: string;
  pattern: string;
  drills: string[];
  progress: string;
}

export function buildSessionDebrief(
  room: RoomContent,
  session: SessionResult,
  priorInRoom: number,
  bestScoreInRoom: number | null,
  streakDays: number
): SessionDebrief {
  const main = session.trials.filter((t) => t.phase === "main");
  const errors = main.filter((t) => t.correct === false).length;
  const early = main.slice(0, Math.floor(main.length * 0.4));
  const late = main.slice(Math.floor(main.length * 0.6));

  const meanRt = (trials: typeof main) => {
    const rts = trials.map((t) => t.rtMs).filter((r): r is number => r !== null);
    return rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : null;
  };

  const earlyRt = meanRt(early);
  const lateRt = meanRt(late);
  const accPct = Math.round(session.accuracy * 100);

  let pattern = "RT held steady across the block.";
  if (earlyRt && lateRt && lateRt > earlyRt * 1.12) {
    pattern = `Pace slowed in the last third (${earlyRt}ms → ${lateRt}ms). Often fatigue or divided attention.`;
  } else if (errors > main.length * 0.25) {
    pattern = `${errors} errors on main trials. Re-read the briefing and slow your first response on each item.`;
  } else if (session.rtCvPct > 35) {
    pattern = `High RT variability (${session.rtCvPct.toFixed(1)}%). Steadier pacing usually beats raw speed here.`;
  } else if (accPct >= 90) {
    pattern = "Accuracy is strong. Push for faster correct responses without trading errors.";
  }

  const summary = `${accPct}% accuracy, ${Math.round(session.meanRtMs)}ms mean RT on correct trials. ${room.paradigm} in ${room.code}.`;

  const drills: string[] = [];
  if (priorInRoom === 0) {
    drills.push(`Run ${room.code} once more tomorrow before changing rooms.`);
    drills.push(`Read the ${room.originalStudy.year} study on the literature page.`);
    drills.push(`Note one moment you were surprised by your own error pattern.`);
  } else {
    drills.push(
      bestScoreInRoom !== null && session.score >= bestScoreInRoom
        ? `You matched or beat your best (${bestScoreInRoom}). Hold accuracy while shaving 5% off median RT.`
        : `Beat your room best of ${bestScoreInRoom ?? session.score} on the next rep.`
    );
    drills.push(`Practice ${room.skills[0]?.toLowerCase() ?? "the core skill"} for five minutes before entering.`);
    drills.push(
      room.learningGoals[1]
        ? `Revisit goal: ${room.learningGoals[1]}`
        : `Compare your curve to ${room.originalStudy.researchers[0]} (${room.originalStudy.year}).`
    );
  }

  const progress =
    priorInRoom === 0
      ? "First logged rep in this room."
      : `${priorInRoom} prior rep${priorInRoom === 1 ? "" : "s"} here · ${streakDays} training day${streakDays === 1 ? "" : "s"} logged`;

  return { summary, pattern, drills, progress };
}
