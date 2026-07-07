import { create } from "zustand";
import { newSeed } from "@/lib/game/rng";
import { summarize } from "@/lib/game/scoring";
import type { SessionResult, TrialRecord } from "@/lib/game/types";
import { saveSession } from "@/lib/game/history";
import { startingItems, type InventoryItem } from "@/lib/game/inventory";

type GamePhase = "briefing" | "running" | "paused" | "complete";

interface GameState {
  phase: GamePhase;
  roomSlug: string | null;
  sessionId: string | null;
  seed: number;
  startedAtPerf: number;
  startedAtISO: string;
  trials: TrialRecord[];
  hintsUsed: number;
  inventory: InventoryItem[];
  objective: string;
  progress: number;
  result: SessionResult | null;

  start: (roomSlug: string) => void;
  begin: () => void;
  record: (trial: Omit<TrialRecord, "index" | "shownAt">) => void;
  addItem: (item: InventoryItem) => void;
  setObjective: (text: string) => void;
  setProgress: (fraction: number) => void;
  pause: () => void;
  resume: () => void;
  spendHint: () => void;
  complete: (highlights?: SessionResult["highlights"]) => SessionResult;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "briefing",
  roomSlug: null,
  sessionId: null,
  seed: 0,
  startedAtPerf: 0,
  startedAtISO: "",
  trials: [],
  hintsUsed: 0,
  inventory: [],
  objective: "",
  progress: 0,
  result: null,

  start: (roomSlug) =>
    set({
      phase: "briefing",
      roomSlug,
      sessionId: `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      seed: newSeed(),
      trials: [],
      hintsUsed: 0,
      inventory: startingItems(roomSlug),
      objective: "",
      progress: 0,
      result: null,
    }),

  begin: () =>
    set({
      phase: "running",
      startedAtPerf: performance.now(),
      startedAtISO: new Date().toISOString(),
    }),

  record: (trial) =>
    set((s) => ({
      trials: [
        ...s.trials,
        {
          ...trial,
          index: s.trials.length,
          shownAt: Math.round(performance.now() - s.startedAtPerf),
        },
      ],
    })),

  addItem: (item) =>
    set((s) =>
      s.inventory.some((i) => i.id === item.id)
        ? s
        : { inventory: [...s.inventory, item] }
    ),

  setObjective: (objective) => set({ objective }),
  setProgress: (progress) => set({ progress }),
  pause: () => set((s) => (s.phase === "running" ? { phase: "paused" } : {})),
  resume: () => set((s) => (s.phase === "paused" ? { phase: "running" } : {})),
  spendHint: () => set((s) => ({ hintsUsed: s.hintsUsed + 1 })),

  complete: (highlights = []) => {
    const s = get();
    const stats = summarize(s.trials);
    const result: SessionResult = {
      id: s.sessionId ?? `s_${Date.now().toString(36)}`,
      roomSlug: s.roomSlug ?? "unknown",
      seed: s.seed,
      startedAtISO: s.startedAtISO,
      durationMs: Math.round(performance.now() - s.startedAtPerf),
      trials: s.trials,
      hintsUsed: s.hintsUsed,
      score: stats.score,
      accuracy: stats.accuracy,
      meanRtMs: stats.meanRtMs,
      rtCvPct: stats.rtCvPct,
      highlights,
    };
    set({ phase: "complete", result });
    saveSession(result);
    return result;
  },

  reset: () =>
    set({
      phase: "briefing",
      roomSlug: null,
      sessionId: null,
      trials: [],
      hintsUsed: 0,
      inventory: [],
      objective: "",
      progress: 0,
      result: null,
    }),
}));
