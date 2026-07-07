export interface TrialRecord {
  index: number;
  phase: "practice" | "main";
  /** Engine-specific stimulus descriptor, serialized to research exports. */
  stimulus: Record<string, unknown>;
  expected: string | null;
  response: string | null;
  correct: boolean | null;
  rtMs: number | null;
  shownAt: number; // ms since session start (monotonic)
}

export interface SessionResult {
  id: string;
  roomSlug: string;
  seed: number;
  startedAtISO: string;
  durationMs: number;
  trials: TrialRecord[];
  hintsUsed: number;
  score: number;
  accuracy: number;
  meanRtMs: number;
  rtCvPct: number;
  /** Engine-specific extras surfaced on the results page. */
  highlights: { label: string; value: string; hint?: string }[];
}

export interface EngineApi {
  /** Record a completed trial. */
  record: (trial: Omit<TrialRecord, "index" | "shownAt">) => void;
  /** Milliseconds since session start (monotonic clock). */
  now: () => number;
  /** Update the objective line in the HUD. */
  setObjective: (text: string) => void;
  /** Report progress 0–1 for the HUD progress hairline. */
  setProgress: (fraction: number) => void;
  /** Engine declares the run finished, optionally attaching highlights. */
  complete: (highlights?: SessionResult["highlights"]) => void;
  /** Consume a hint (returns hint text for the current engine state). */
  paused: boolean;
  seed: number;
  config: Record<string, unknown>;
}
