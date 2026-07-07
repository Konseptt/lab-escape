"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useEngine, usePausableTimeout } from "../use-engine";
import { Stage, Interstitial } from "../primitives";
import { Button } from "@/components/ui/button";

type Phase = "ready" | "panel" | "respond" | "done";

interface LineTrial {
  reference: number; // px height
  options: [number, number, number];
  correct: number; // index
  critical: boolean; // panel unanimously wrong
  allyDissent: boolean; // one panelist gives the right answer
}

const PANEL_NAMES = ["P-07", "P-12", "P-19", "P-23", "P-31"];

/**
 * Asch conformity. Judge line lengths after seeing a simulated panel of
 * previous participants answer. On critical trials the panel is unanimously
 * wrong; late in the block one panelist dissents.
 */
export function ConformityEngine({ config }: { config: Record<string, unknown> }) {
  const { rng, record, setObjective, setProgress, complete } = useEngine();
  const after = usePausableTimeout();

  const nTrials = (config.trials as number) ?? 14;
  const allyTrial = (config.allyTrial as number) ?? nTrials - 4;

  const trials = useMemo<LineTrial[]>(() => {
    // Critical trials at fixed positions (after 2 honest warmups), like Asch.
    const criticalSet = new Set([2, 4, 5, 7, 9, 11, 12, 13].slice(0, 8));
    return Array.from({ length: nTrials }, (_, i) => {
      const reference = 90 + Math.floor(rng() * 100);
      const correctIdx = Math.floor(rng() * 3);
      const options = [0, 0, 0].map((_, j) => {
        if (j === correctIdx) return reference;
        const delta = (18 + Math.floor(rng() * 26)) * (rng() > 0.5 ? 1 : -1);
        return Math.max(50, reference + delta);
      }) as [number, number, number];
      return {
        reference,
        options,
        correct: correctIdx,
        critical: criticalSet.has(i),
        allyDissent: criticalSet.has(i) && i >= allyTrial,
      };
    });
  }, [rng, nTrials, allyTrial]);

  const [phase, setPhase] = useState<Phase>("ready");
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const shownAtRef = useRef(0);
  const conformedRef = useRef(0);
  const criticalSeenRef = useRef(0);
  const trial = trials[idx];

  // Panel answer: wrong-but-unanimous on critical trials.
  const panelAnswers = useMemo(() => {
    if (!trial) return [];
    const wrong = trial.critical
      ? (trial.correct + 1 + Math.floor(rng() * 2)) % 3
      : trial.correct;
    return PANEL_NAMES.map((name, i) => ({
      name,
      answer:
        trial.allyDissent && i === PANEL_NAMES.length - 1 ? trial.correct : wrong,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  useEffect(() => {
    setObjective("Which line matches the reference?");
  }, [setObjective]);
  useEffect(() => {
    setProgress(idx / nTrials);
  }, [idx, nTrials, setProgress]);

  const startTrial = useCallback(() => {
    setPhase("panel");
    setRevealed(0);
    const step = (i: number) => {
      if (i >= PANEL_NAMES.length) {
        shownAtRef.current = performance.now();
        setPhase("respond");
        return;
      }
      setRevealed(i + 1);
      after(700, () => step(i + 1));
    };
    after(500, () => step(0));
  }, [after]);

  const respond = useCallback(
    (choice: number) => {
      if (phase !== "respond" || !trial) return;
      const conformed =
        trial.critical && choice !== trial.correct && choice === panelAnswers[0].answer;
      if (trial.critical) {
        criticalSeenRef.current += 1;
        if (conformed) conformedRef.current += 1;
      }
      record({
        phase: "main",
        stimulus: {
          critical: trial.critical,
          allyDissent: trial.allyDissent,
          panelAnswer: panelAnswers[0].answer,
        },
        expected: String(trial.correct),
        response: String(choice),
        correct: choice === trial.correct,
        rtMs: Math.round(performance.now() - shownAtRef.current),
      });
      if (idx + 1 >= nTrials) {
        setPhase("done");
        complete([
          {
            label: "Yielded to the majority",
            value: `${conformedRef.current} / ${criticalSeenRef.current}`,
            hint: "Asch: 36.8% of critical responses conformed",
          },
        ]);
      } else {
        setIdx((i) => i + 1);
        setPhase("ready");
      }
    },
    [phase, trial, panelAnswers, record, idx, nTrials, complete]
  );

  if (phase === "ready") {
    return (
      <Stage>
        <Interstitial
          eyebrow={`Judgment ${idx + 1} of ${nTrials}`}
          title="The panel answers first"
          body={
            idx === 0
              ? "Five previous participants answered this same comparison. Their responses appear before yours. Then judge for yourself."
              : undefined
          }
          action={
            <Button onClick={startTrial} autoFocus>
              Show the comparison
            </Button>
          }
        />
      </Stage>
    );
  }

  if (phase === "done" || !trial) return null;

  return (
    <Stage>
      <div className="grid w-full max-w-2xl grid-cols-[1fr_auto] gap-10">
        {/* Stimulus */}
        <div>
          <div className="flex items-end gap-14 border border-border bg-surface px-10 py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-1 bg-foreground" style={{ height: trial.reference }} />
              <span className="label-micro text-faint">Ref</span>
            </div>
            <div className="flex items-end gap-8">
              {trial.options.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={phase !== "respond"}
                  onClick={() => respond(i)}
                  className="group flex flex-col items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-default"
                >
                  <div
                    className="w-1 bg-muted-foreground transition-colors group-hover:bg-primary"
                    style={{ height: h }}
                  />
                  <span className="border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground group-hover:border-primary group-hover:text-primary">
                    {["A", "B", "C"][i]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-[11px] text-faint">
            {phase === "respond" ? "your answer" : "panel responding…"}
          </p>
        </div>

        {/* Panel */}
        <div className="flex w-36 flex-col gap-2" aria-live="polite">
          <p className="label-micro text-faint">Panel</p>
          {panelAnswers.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: revealed > i ? 1 : 0.3 }}
              className="flex items-center justify-between border border-border bg-surface px-3 py-2"
            >
              <span className="font-mono text-[11px] text-faint">{p.name}</span>
              <span className="font-mono text-sm text-foreground">
                {revealed > i ? ["A", "B", "C"][p.answer] : "·"}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Stage>
  );
}
