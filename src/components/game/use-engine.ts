"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useGameStore } from "@/stores/game-store";
import { mulberry32 } from "@/lib/game/rng";
import type { SessionResult, TrialRecord } from "@/lib/game/types";

/**
 * Shared engine plumbing: seeded RNG, monotonic clock, trial recording,
 * HUD wiring, and pause awareness. Every paradigm engine builds on this.
 */
export function useEngine() {
  const seed = useGameStore((s) => s.seed);
  const phase = useGameStore((s) => s.phase);
  const record = useGameStore((s) => s.record);
  const setObjective = useGameStore((s) => s.setObjective);
  const setProgress = useGameStore((s) => s.setProgress);
  const complete = useGameStore((s) => s.complete);
  const startedAtPerf = useGameStore((s) => s.startedAtPerf);

  const rng = useMemo(() => mulberry32(seed), [seed]);
  const paused = phase === "paused";
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const now = useCallback(
    () => Math.round(performance.now() - startedAtPerf),
    [startedAtPerf]
  );

  const recordTrial = useCallback(
    (t: Omit<TrialRecord, "index" | "shownAt">) => record(t),
    [record]
  );

  const finish = useCallback(
    (highlights?: SessionResult["highlights"]) => complete(highlights),
    [complete]
  );

  return {
    rng,
    paused,
    pausedRef,
    now,
    record: recordTrial,
    setObjective,
    setProgress,
    complete: finish,
  };
}

/** Pause-aware timeout. Timers freeze while the session is paused. */
export function usePausableTimeout() {
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const phase = useGameStore((s) => s.phase);
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const after = useCallback((ms: number, fn: () => void) => {
    const tick = (remaining: number, last: number) => {
      const t = setTimeout(() => {
        timers.current.delete(t);
        const nowTs = performance.now();
        if (phaseRef.current === "paused") {
          tick(remaining, nowTs); // don't burn time while paused
          return;
        }
        const left = remaining - (nowTs - last);
        if (left <= 0) fn();
        else tick(left, nowTs);
      }, Math.min(remaining, 50));
      timers.current.add(t);
    };
    tick(ms, performance.now());
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return after;
}
