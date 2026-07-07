"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useEngine } from "../use-engine";
import { Stage, Interstitial } from "../primitives";
import { shuffle } from "@/lib/game/rng";
import { useGameStore } from "@/stores/game-store";
import { Button } from "@/components/ui/button";

interface Mover {
  id: number;
  target: boolean; // white = track these
  x: number;
  y: number;
  vx: number;
  vy: number;
}

type Phase = "ready" | "tracking" | "count" | "probe" | "done";

/**
 * Inattentional blindness (Simons & Chabris paradigm, abstracted).
 * Track white shapes bouncing among dark distractors and count their wall
 * bounces. On the critical trial an unexpected cross drifts across the field.
 * Afterwards: "did you see anything unusual?"
 */
export function SearchEngine({ config }: { config: Record<string, unknown> }) {
  void config; // engine parameters are fixed for this paradigm build
  const { rng, record, setObjective, setProgress, complete } = useEngine();
  const pausedRef = useRef(false);
  const phase = useGameStore((s) => s.phase);
  useEffect(() => {
    pausedRef.current = phase === "paused";
  }, [phase]);

  const nTrials = 6; // condensed block count; each trial ~15s of tracking
  const unexpectedTrialIdx = 4;

  const [trialN, setTrialN] = useState(0);
  const [stage, setStage] = useState<Phase>("ready");
  const [bounceGuess, setBounceGuess] = useState<number | null>(null);
  const actualBouncesRef = useRef(0);
  const sawIntruderRef = useRef<boolean | null>(null);
  const trialStartRef = useRef(0);
  const countStartRef = useRef(0);

  const W = 640;
  const H = 400;
  const isCritical = trialN === unexpectedTrialIdx;
  const setSize = useMemo(() => [8, 10, 12][trialN % 3], [trialN]);

  const [movers, setMovers] = useState<Mover[]>([]);
  const [intruder, setIntruder] = useState<{ x: number; y: number } | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    setObjective("Count wall bounces made by the WHITE shapes");
  }, [setObjective]);
  useEffect(() => {
    setProgress(trialN / nTrials);
  }, [trialN, setProgress]);

  const startTrial = useCallback(() => {
    const init: Mover[] = Array.from({ length: setSize }, (_, i) => {
      const speed = 90 + rng() * 60;
      const angle = rng() * Math.PI * 2;
      return {
        id: i,
        target: i < setSize / 2,
        x: 40 + rng() * (W - 80),
        y: 40 + rng() * (H - 80),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      };
    });
    actualBouncesRef.current = 0;
    setMovers(shuffle(rng, init));
    setIntruder(null);
    setBounceGuess(null);
    setStage("tracking");
    trialStartRef.current = performance.now();

    const duration = 12000;
    let last = performance.now();
    let intruderX = -30;
    const intruderY = H / 2 + (rng() - 0.5) * 60;
    let elapsed = 0;

    const tick = (nowTs: number) => {
      const dt = Math.min((nowTs - last) / 1000, 0.05);
      last = nowTs;
      if (!pausedRef.current) {
        elapsed += dt * 1000;
        setMovers((prev) =>
          prev.map((m) => {
            let { x, y, vx, vy } = m;
            x += vx * dt;
            y += vy * dt;
            if (x < 14 || x > W - 14) {
              vx = -vx;
              x = Math.max(14, Math.min(W - 14, x));
              if (m.target) actualBouncesRef.current += 1;
            }
            if (y < 14 || y > H - 14) {
              vy = -vy;
              y = Math.max(14, Math.min(H - 14, y));
              if (m.target) actualBouncesRef.current += 1;
            }
            return { ...m, x, y, vx, vy };
          })
        );
        if (isCritical && elapsed > duration * 0.35 && elapsed < duration * 0.8) {
          intruderX += 110 * dt;
          setIntruder({ x: intruderX, y: intruderY });
        } else if (isCritical && elapsed >= duration * 0.8) {
          setIntruder(null);
        }
      }
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        countStartRef.current = performance.now();
        setStage("count");
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [rng, setSize, isCritical]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const finish = useCallback(() => {
    setStage("done");
    complete([
      {
        label: "Unexpected object",
        value:
          sawIntruderRef.current === null
            ? "-"
            : sawIntruderRef.current
              ? "Noticed"
              : "Missed",
        hint: "46% of Simons & Chabris’ observers missed the gorilla",
      },
    ]);
  }, [complete]);

  const submitCount = useCallback(
    (guess: number) => {
      setBounceGuess(guess);
      const actual = actualBouncesRef.current;
      const err = Math.abs(guess - actual);
      record({
        phase: "main",
        stimulus: { setSize, actualBounces: actual, critical: isCritical },
        expected: String(actual),
        response: String(guess),
        correct: err <= 1,
        rtMs: Math.round(performance.now() - countStartRef.current),
      });
      if (isCritical) {
        setStage("probe");
      } else if (trialN + 1 >= nTrials) {
        finish();
      } else {
        setTrialN((t) => t + 1);
        setStage("ready");
      }
    },
    [record, setSize, isCritical, trialN, finish]
  );

  const answerProbe = useCallback(
    (saw: boolean) => {
      sawIntruderRef.current = saw;
      record({
        phase: "main",
        stimulus: { probe: "unexpected-object" },
        expected: "seen",
        response: saw ? "seen" : "missed",
        correct: saw,
        rtMs: null,
      });
      if (trialN + 1 >= nTrials) {
        finish();
      } else {
        setTrialN((t) => t + 1);
        setStage("ready");
      }
    },
    [record, trialN, finish]
  );

  if (stage === "ready") {
    return (
      <Stage>
        <Interstitial
          eyebrow={`Block ${trialN + 1} of ${nTrials}`}
          title={`Track the white shapes`}
          body={`${setSize / 2} white targets among ${setSize / 2} dark distractors. Count every wall bounce made by a white shape. 12 seconds.`}
          action={
            <Button onClick={startTrial} autoFocus>
              Begin block
            </Button>
          }
        />
      </Stage>
    );
  }

  if (stage === "count") {
    return (
      <Stage>
        <Interstitial
          eyebrow="Report"
          title="How many bounces?"
          action={
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 15 }, (_, i) => i + 2).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => submitCount(n)}
                  className="flex size-12 items-center justify-center border border-border bg-surface font-mono text-sm tabular transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {n}
                </button>
              ))}
            </div>
          }
        />
        {bounceGuess !== null ? null : null}
      </Stage>
    );
  }

  if (stage === "probe") {
    return (
      <Stage>
        <Interstitial
          eyebrow="One more question"
          title="Did you notice anything unusual?"
          body="Something other than the shapes you were tracking."
          action={
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => answerProbe(false)}>
                No, nothing
              </Button>
              <Button onClick={() => answerProbe(true)}>
                Yes, something crossed the field
              </Button>
            </div>
          }
        />
      </Stage>
    );
  }

  return (
    <Stage>
      <div
        className="relative border border-border bg-surface"
        style={{ width: W, height: H, maxWidth: "100%" }}
        role="img"
        aria-label="Field of moving shapes. Count bounces of white shapes."
      >
        {movers.map((m) => (
          <div
            key={m.id}
            className="absolute size-6"
            style={{
              transform: `translate(${m.x - 12}px, ${m.y - 12}px)`,
              background: m.target ? "var(--foreground)" : "oklch(0.32 0.004 85)",
              borderRadius: m.target ? "50%" : 0,
            }}
          />
        ))}
        {intruder ? (
          <motion.div
            className="absolute flex size-7 items-center justify-center text-xl font-light text-muted-foreground"
            style={{ transform: `translate(${intruder.x}px, ${intruder.y}px)` }}
          >
            ✕
          </motion.div>
        ) : null}
      </div>
      <p className="mt-6 font-mono text-[11px] text-faint">
        tracking · block {trialN + 1} / {nTrials}
      </p>
    </Stage>
  );
}
