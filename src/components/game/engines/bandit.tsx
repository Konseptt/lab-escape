"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useEngine, usePausableTimeout } from "../use-engine";
import { Stage, Interstitial } from "../primitives";
import { Button } from "@/components/ui/button";

type Phase = "ready" | "choosing" | "feedback" | "done";

/**
 * Three-armed bandit with a mid-block reversal (reinforcement learning).
 * Measures learning rate and exploration policy.
 */
export function BanditEngine({ config }: { config: Record<string, unknown> }) {
  const { rng, record, setObjective, setProgress, complete } = useEngine();
  const after = usePausableTimeout();

  const nTrials = (config.trials as number) ?? 60;
  const reversalAt = (config.reversalAt as number) ?? Math.floor(nTrials / 2);
  const baseProbs = useMemo(
    () => (config.baseProbs as number[]) ?? [0.7, 0.4, 0.2],
    [config.baseProbs]
  );

  const [phase, setPhase] = useState<Phase>("ready");
  const [trialN, setTrialN] = useState(0);
  const [lastOutcome, setLastOutcome] = useState<{ arm: number; win: boolean } | null>(null);
  const [energy, setEnergy] = useState(0);
  const shownAtRef = useRef(0);
  const postReversalBestRef = useRef<number[]>([]);

  // After reversal, best and worst arms swap.
  const probs = useCallback(
    (t: number) =>
      t >= reversalAt
        ? [baseProbs[2], baseProbs[1], baseProbs[0]]
        : baseProbs,
    [reversalAt, baseProbs]
  );

  useEffect(() => {
    setObjective("Charge the exit door, pick the panel that pays");
  }, [setObjective]);
  useEffect(() => {
    setProgress(trialN / nTrials);
  }, [trialN, nTrials, setProgress]);
  useEffect(() => {
    if (phase === "choosing") shownAtRef.current = performance.now();
  }, [phase, trialN]);

  const choose = useCallback(
    (arm: number) => {
      if (phase !== "choosing") return;
      const p = probs(trialN);
      const win = rng() < p[arm];
      const bestArm = p.indexOf(Math.max(...p));
      if (trialN >= reversalAt) {
        postReversalBestRef.current.push(arm === bestArm ? 1 : 0);
      }
      record({
        phase: "main",
        stimulus: { arm, probs: p, reversed: trialN >= reversalAt },
        expected: String(bestArm),
        response: String(arm),
        correct: arm === bestArm,
        rtMs: Math.round(performance.now() - shownAtRef.current),
      });
      setLastOutcome({ arm, win });
      if (win) setEnergy((e) => e + 1);
      setPhase("feedback");
      after(650, () => {
        if (trialN + 1 >= nTrials) {
          // Trials to re-acquire best arm after reversal: first index where
          // a 5-trial moving window is majority-best.
          const seq = postReversalBestRef.current;
          let adapt = seq.length;
          for (let i = 0; i + 5 <= seq.length; i++) {
            if (seq.slice(i, i + 5).reduce((a, b) => a + b, 0) >= 4) {
              adapt = i;
              break;
            }
          }
          setPhase("done");
          complete([
            {
              label: "Trials to adapt after reversal",
              value: String(adapt),
              hint: "The reward contingencies silently swapped mid-block",
            },
            { label: "Energy collected", value: String(energy + (win ? 1 : 0)) },
          ]);
        } else {
          setLastOutcome(null);
          setTrialN((t) => t + 1);
          setPhase("choosing");
        }
      });
    },
    [phase, probs, trialN, rng, reversalAt, record, after, nTrials, complete, energy]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 3) choose(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose]);

  if (phase === "ready") {
    return (
      <Stage>
        <Interstitial
          eyebrow="Reinforcement protocol"
          title="Three panels, hidden odds"
          body={`Each panel pays energy with a fixed hidden probability. Collect as much as you can in ${nTrials} pulls. The odds may not stay put.`}
          action={
            <Button onClick={() => setPhase("choosing")} autoFocus>
              Start pulling
            </Button>
          }
        />
      </Stage>
    );
  }

  if (phase === "done") return null;

  return (
    <Stage>
      <div className="mb-12 flex items-center gap-4">
        <span className="label-micro text-faint">Door charge</span>
        <div className="h-1.5 w-48 bg-muted">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${Math.min((energy / (nTrials * 0.55)) * 100, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="font-mono text-sm tabular">{energy}</span>
      </div>

      <div className="flex gap-4">
        {[0, 1, 2].map((arm) => {
          const isLast = lastOutcome?.arm === arm;
          return (
            <motion.button
              key={arm}
              type="button"
              onClick={() => choose(arm)}
              disabled={phase !== "choosing"}
              whileTap={{ scale: 0.97 }}
              animate={
                isLast
                  ? {
                      borderColor: lastOutcome.win
                        ? "var(--success)"
                        : "var(--destructive)",
                    }
                  : { borderColor: "var(--border)" }
              }
              className="flex h-40 w-28 flex-col items-center justify-between border bg-surface py-5 transition-colors hover:border-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-default"
            >
              <span className="font-mono text-[10px] text-faint">PANEL {arm + 1}</span>
              <span className="text-3xl" aria-hidden="true">
                {isLast ? (lastOutcome.win ? "▲" : "-") : "◌"}
              </span>
              <span
                className={`font-mono text-[11px] ${
                  isLast
                    ? lastOutcome.win
                      ? "text-success"
                      : "text-destructive"
                    : "text-faint"
                }`}
              >
                {isLast ? (lastOutcome.win ? "+1 energy" : "nothing") : `key ${arm + 1}`}
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-8 font-mono text-[11px] text-faint">
        pull {trialN + 1} / {nTrials}
      </p>
    </Stage>
  );
}
