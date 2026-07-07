import { ROOMS, getRoom } from "@/lib/content/rooms";
import { buildTrainingPlan } from "@/lib/training/plan";
import type { PathwayStep } from "@/components/subject-pathway";
import type { SessionResult } from "@/lib/game/types";

export interface UxFlagSet {
  briefingViewed: Set<string>;
  debriefViewed: Set<string>;
  scienceViewed: Set<string>;
  checklistDismissed: boolean;
}

export interface NextAction {
  label: string;
  href: string;
  rationale: string;
  step: PathwayStep;
}

const FIRST_ROOM = "invisible-gorilla";

export function resolveNextAction(
  sessions: SessionResult[],
  flags: UxFlagSet
): NextAction {

  if (sessions.length === 0) {
    const room = getRoom(FIRST_ROOM)!;
    return {
      label: "Open briefing",
      href: `/experiments/${FIRST_ROOM}`,
      rationale: `${room.title} takes about ${room.durationMin} minutes. The briefing tells you what gets measured.`,
      step: "brief",
    };
  }

  const last = sessions[0];
  const lastRoom = getRoom(last.roomSlug);

  if (!flags.debriefViewed.has(last.id)) {
    return {
      label: "Review debrief",
      href: `/results/${last.id}`,
      rationale: "Read your trial data before starting another room.",
      step: "debrief",
    };
  }

  if (lastRoom && !flags.scienceViewed.has(last.roomSlug)) {
    return {
      label: "Read literature",
      href: `/science/${last.roomSlug}`,
      rationale: `Connect your numbers to ${lastRoom.originalStudy.researchers[0]} (${lastRoom.originalStudy.year}).`,
      step: "literature",
    };
  }

  const plan = buildTrainingPlan(sessions);
  const focus = getRoom(plan.focusRoomSlug) ?? ROOMS[0];

  if (!flags.briefingViewed.has(plan.focusRoomSlug)) {
    return {
      label: "Open briefing",
      href: `/experiments/${plan.focusRoomSlug}`,
      rationale: plan.reason,
      step: "brief",
    };
  }

  return {
    label: "Begin session",
    href: `/play/${plan.focusRoomSlug}`,
    rationale: `${focus.code}: ${plan.weeklyGoal}`,
    step: "session",
  };
}

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  href?: string;
}

export function buildTrainingChecklist(
  sessions: SessionResult[],
  flags: UxFlagSet
): ChecklistItem[] {
  const hasSession = sessions.length > 0;
  const last = sessions[0];
  const firstRoom = FIRST_ROOM;

  return [
    {
      id: "brief",
      label: "Read a protocol briefing",
      detail: "Know the variables before you enter the room.",
      done: flags.briefingViewed.size > 0 || hasSession,
      href: `/experiments/${firstRoom}`,
    },
    {
      id: "session",
      label: "Complete your first rep",
      detail: "One measured block with trial-level logging.",
      done: hasSession,
      href: hasSession ? `/play/${firstRoom}` : `/experiments/${firstRoom}`,
    },
    {
      id: "debrief",
      label: "Review your debrief",
      detail: "Scores, RT curve, and session notes.",
      done: hasSession && flags.debriefViewed.has(last.id),
      href: hasSession ? `/results/${last.id}` : undefined,
    },
    {
      id: "literature",
      label: "Read the original study",
      detail: "Close the loop: your data vs the published finding.",
      done: hasSession && flags.scienceViewed.has(last.roomSlug),
      href: hasSession ? `/science/${last.roomSlug}` : undefined,
    },
  ];
}

export function checklistProgress(items: ChecklistItem[]): number {
  if (items.length === 0) return 0;
  return Math.round((items.filter((i) => i.done).length / items.length) * 100);
}
