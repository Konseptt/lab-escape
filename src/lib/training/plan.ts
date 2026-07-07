import { ROOMS } from "@/lib/content/rooms";
import type { SessionResult } from "@/lib/game/types";

export interface TrainingPlan {
  focusRoomSlug: string;
  focusLabel: string;
  reason: string;
  weeklyGoal: string;
  skillsThisWeek: string[];
}

export function buildTrainingPlan(sessions: SessionResult[]): TrainingPlan {
  const byRoom = new Map<string, SessionResult[]>();
  for (const s of sessions) {
    const list = byRoom.get(s.roomSlug) ?? [];
    list.push(s);
    byRoom.set(s.roomSlug, list);
  }

  const completed = new Set(sessions.map((s) => s.roomSlug));
  const unlocked = ROOMS.filter((r) => !r.unlockAfter || completed.has(r.unlockAfter));
  const uncleared = unlocked.filter((r) => !completed.has(r.slug));

  let focus = uncleared[0] ?? ROOMS[0];
  let reason = "Next uncleared room in the wing sequence.";

  if (uncleared.length === 0) {
    let weakest: { room: (typeof ROOMS)[0]; acc: number } | null = null;
    for (const room of ROOMS) {
      const reps = byRoom.get(room.slug) ?? [];
      if (reps.length === 0) continue;
      const acc = reps.reduce((a, s) => a + s.accuracy, 0) / reps.length;
      if (!weakest || acc < weakest.acc) weakest = { room, acc };
    }
    if (weakest) {
      focus = weakest.room;
      reason = `Lowest mean accuracy (${Math.round(weakest.acc * 100)}%) across your logged reps.`;
    } else {
      focus = ROOMS[0];
      reason = "Start the attention wing. One rep establishes your baseline.";
    }
  }

  const repsInFocus = byRoom.get(focus.slug)?.length ?? 0;
  const weeklyGoal =
    repsInFocus === 0
      ? `Complete 2 sessions in ${focus.code} this week.`
      : `Run 3 more reps in ${focus.code}; aim to beat your best score.`;

  return {
    focusRoomSlug: focus.slug,
    focusLabel: `${focus.code} ${focus.title}`,
    reason,
    weeklyGoal,
    skillsThisWeek: focus.skills.slice(0, 3),
  };
}

export function trainingStats(sessions: SessionResult[]) {
  const byRoom = (slug: string) => sessions.filter((s) => s.roomSlug === slug);
  const priorInRoom = (slug: string) => Math.max(0, byRoom(slug).length - 1);
  const bestScoreInRoom = (slug: string) => {
    const scores = byRoom(slug).map((s) => s.score);
    return scores.length ? Math.max(...scores) : null;
  };

  const daySet = new Set(
    sessions.map((s) => s.startedAtISO.slice(0, 10))
  );
  const streakDays = daySet.size;

  return { priorInRoom, bestScoreInRoom, streakDays, byRoom };
}
