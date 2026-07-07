"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useEngine } from "../use-engine";
import { Stage, Interstitial } from "../primitives";
import { shuffle } from "@/lib/game/rng";
import { Button } from "@/components/ui/button";

interface Scenario {
  pairId: number;
  frame: "gain" | "loss";
  setup: string;
  sure: string;
  gamble: string;
  /** Risk-seeking = choosing the gamble. */
}

const PAIRS: { setup: string; gain: [string, string]; loss: [string, string] }[] = [
  {
    setup:
      "An outbreak in the facility threatens 600 researchers. Two response programs are on the table.",
    gain: [
      "Program A: 200 people will be saved.",
      "Program B: 1/3 chance all 600 are saved, 2/3 chance no one is saved.",
    ],
    loss: [
      "Program A: 400 people will die.",
      "Program B: 1/3 chance no one dies, 2/3 chance all 600 die.",
    ],
  },
  {
    setup:
      "A grant of $6,000 hangs on your next decision about the lab's equipment budget.",
    gain: [
      "Option A: keep $2,000 for certain.",
      "Option B: 1/3 chance to keep all $6,000, 2/3 chance to keep nothing.",
    ],
    loss: [
      "Option A: lose $4,000 for certain.",
      "Option B: 1/3 chance to lose nothing, 2/3 chance to lose all $6,000.",
    ],
  },
  {
    setup:
      "A power fault will corrupt 300 archived datasets unless you act now.",
    gain: [
      "Plan A: 100 datasets will be preserved.",
      "Plan B: 1/3 chance all 300 are preserved, 2/3 chance none are.",
    ],
    loss: [
      "Plan A: 200 datasets will be corrupted.",
      "Plan B: 1/3 chance none are corrupted, 2/3 chance all 300 are.",
    ],
  },
  {
    setup:
      "Ninety participants are enrolled in a longitudinal study at risk of cancellation.",
    gain: [
      "Path A: 30 participants stay enrolled.",
      "Path B: 1/3 chance all 90 stay, 2/3 chance the study loses everyone.",
    ],
    loss: [
      "Path A: 60 participants are dropped.",
      "Path B: 1/3 chance no one is dropped, 2/3 chance all 90 are.",
    ],
  },
  {
    setup:
      "Twelve field stations face a funding cliff at the end of the quarter.",
    gain: [
      "Proposal A: 4 stations remain open.",
      "Proposal B: 1/3 chance all 12 remain open, 2/3 chance all close.",
    ],
    loss: [
      "Proposal A: 8 stations close.",
      "Proposal B: 1/3 chance none close, 2/3 chance all 12 close.",
    ],
  },
];

type Phase = "ready" | "deciding" | "done";

/**
 * Framing effect (Tversky & Kahneman). Matched gain/loss pairs are separated
 * in the sequence; susceptibility = risk choice flipping between frames.
 */
export function FramingEngine({ config }: { config: Record<string, unknown> }) {
  const { rng, record, setObjective, setProgress, complete } = useEngine();
  void config;

  const scenarios = useMemo<Scenario[]>(() => {
    const gains: Scenario[] = PAIRS.map((p, i) => ({
      pairId: i,
      frame: "gain",
      setup: p.setup,
      sure: p.gain[0],
      gamble: p.gain[1],
    }));
    const losses: Scenario[] = PAIRS.map((p, i) => ({
      pairId: i,
      frame: "loss",
      setup: p.setup,
      sure: p.loss[0],
      gamble: p.loss[1],
    }));
    // Gains first (shuffled), then losses (shuffled) so pairs never neighbor.
    return [...shuffle(rng, gains), ...shuffle(rng, losses)];
  }, [rng]);

  const [phase, setPhase] = useState<Phase>("ready");
  const [idx, setIdx] = useState(0);
  const shownAtRef = useRef(0);
  const choicesRef = useRef<Map<string, "sure" | "gamble">>(new Map());
  const scenario = scenarios[idx];

  useEffect(() => {
    setObjective("Choose the response you would actually take");
  }, [setObjective]);
  useEffect(() => {
    setProgress(idx / scenarios.length);
  }, [idx, scenarios.length, setProgress]);
  useEffect(() => {
    if (phase === "deciding") shownAtRef.current = performance.now();
  }, [phase, idx]);

  const choose = useCallback(
    (choice: "sure" | "gamble") => {
      choicesRef.current.set(`${scenario.pairId}:${scenario.frame}`, choice);
      record({
        phase: "main",
        stimulus: { pairId: scenario.pairId, frame: scenario.frame },
        expected: null,
        response: choice,
        correct: null, // there is no "correct" answer, consistency is the measure
        rtMs: Math.round(performance.now() - shownAtRef.current),
      });
      if (idx + 1 >= scenarios.length) {
        let flips = 0;
        let pairs = 0;
        for (let p = 0; p < PAIRS.length; p++) {
          const g = choicesRef.current.get(`${p}:gain`);
          const l = choicesRef.current.get(`${p}:loss`);
          if (g && l) {
            pairs++;
            if (g !== l) flips++;
          }
        }
        setPhase("done");
        complete([
          {
            label: "Preference reversals",
            value: `${flips} / ${pairs}`,
            hint: "Identical outcomes, only the wording changed",
          },
        ]);
      } else {
        setIdx((i) => i + 1);
      }
    },
    [scenario, record, idx, scenarios.length, complete]
  );

  if (phase === "ready") {
    return (
      <Stage>
        <Interstitial
          eyebrow="Decision protocol"
          title="Ten decisions"
          body="Each presents a certain option and a gamble. There are no right answers, decide as if the outcomes were real."
          action={
            <Button onClick={() => setPhase("deciding")} autoFocus>
              Open the first door
            </Button>
          }
        />
      </Stage>
    );
  }

  if (phase === "done") return null;

  return (
    <Stage>
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl"
      >
        <p className="label-micro text-faint">
          Decision {idx + 1} of {scenarios.length}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-foreground">
          {scenario.setup}
        </p>
        <div className="mt-10 grid gap-3">
          <button
            type="button"
            onClick={() => choose("sure")}
            className="border border-border bg-surface p-5 text-left text-[0.9375rem] leading-relaxed transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {scenario.sure}
          </button>
          <button
            type="button"
            onClick={() => choose("gamble")}
            className="border border-border bg-surface p-5 text-left text-[0.9375rem] leading-relaxed transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {scenario.gamble}
          </button>
        </div>
      </motion.div>
    </Stage>
  );
}
