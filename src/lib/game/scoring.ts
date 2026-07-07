import type { TrialRecord } from "./types";

export function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

export function sd(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

export interface SummaryStats {
  accuracy: number; // 0–1 over scoreable main trials
  meanRtMs: number;
  rtCvPct: number; // RT coefficient of variation, vigilance/engagement index
  score: number; // 0–1000 composite
  nScored: number;
}

export function summarize(trials: TrialRecord[]): SummaryStats {
  const scored = trials.filter((t) => t.phase === "main" && t.correct !== null);
  const correct = scored.filter((t) => t.correct).length;
  const accuracy = scored.length ? correct / scored.length : 0;
  const rts = scored
    .filter((t) => t.correct && t.rtMs !== null)
    .map((t) => t.rtMs as number);
  const meanRt = mean(rts);
  const cv = meanRt > 0 ? (sd(rts) / meanRt) * 100 : 0;

  // Composite: accuracy dominates, speed and consistency refine.
  const speedBonus = meanRt > 0 ? Math.max(0, 1 - meanRt / 2500) : 0.5;
  const consistencyBonus = Math.max(0, 1 - cv / 100);
  const score = Math.round(
    accuracy * 700 + speedBonus * 180 + consistencyBonus * 120
  );

  return {
    accuracy,
    meanRtMs: meanRt,
    rtCvPct: cv,
    score,
    nScored: scored.length,
  };
}

/** Bucket main trials into fifths and return accuracy per bucket (learning curve). */
export function learningCurve(trials: TrialRecord[], buckets = 5) {
  const scored = trials.filter((t) => t.phase === "main" && t.correct !== null);
  if (scored.length < buckets) return [];
  const size = Math.floor(scored.length / buckets);
  return Array.from({ length: buckets }, (_, i) => {
    const slice = scored.slice(i * size, (i + 1) * size);
    return {
      bucket: i + 1,
      accuracy: slice.filter((t) => t.correct).length / slice.length,
      meanRt: mean(
        slice.filter((t) => t.rtMs !== null).map((t) => t.rtMs as number)
      ),
    };
  });
}
