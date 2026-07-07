"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEngine, usePausableTimeout } from "../use-engine";
import { Stage, Interstitial } from "../primitives";
import { Button } from "@/components/ui/button";

const GLYPHS = ["◐", "◑", "◒", "◓", "◔", "◕", "▲", "▼", "◆", "●", "■", "◉"] as const;

type Phase = "ready" | "flicker" | "done";

/**
 * Change blindness (Rensink flicker paradigm).
 * A grid of instrument glyphs alternates with a modified copy, separated by
 * a blank. Click the cell that changes. Alternation count = search cost.
 */
export function FlickerEngine({ config }: { config: Record<string, unknown> }) {
  const { rng, record, setObjective, setProgress, complete } = useEngine();
  const after = usePausableTimeout();

  const nTrials = (config.trials as number) ?? 12;
  const flickerMs = (config.flickerMs as number) ?? 240;
  const blankMs = (config.blankMs as number) ?? 120;
  const gridSizes = (config.gridSizes as number[]) ?? [9, 16, 25];

  const [trialN, setTrialN] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [cells, setCells] = useState<string[]>([]);
  const [showAlt, setShowAlt] = useState(false);
  const [blank, setBlank] = useState(false);
  const [changedIdx, setChangedIdx] = useState(0);
  const [altGlyph, setAltGlyph] = useState("");
  const [alternations, setAlternations] = useState(0);
  const startRef = useRef(0);
  const runningRef = useRef(false);

  const gridSize = gridSizes[trialN % gridSizes.length];
  const cols = Math.sqrt(gridSize);

  useEffect(() => {
    setObjective("Find the cell that keeps changing");
  }, [setObjective]);
  useEffect(() => {
    setProgress(trialN / nTrials);
  }, [trialN, nTrials, setProgress]);

  const startTrial = useCallback(() => {
    const grid = Array.from(
      { length: gridSize },
      () => GLYPHS[Math.floor(rng() * GLYPHS.length)]
    );
    const idx = Math.floor(rng() * gridSize);
    let alt = grid[idx];
    while (alt === grid[idx]) alt = GLYPHS[Math.floor(rng() * GLYPHS.length)];
    setCells(grid);
    setChangedIdx(idx);
    setAltGlyph(alt);
    setAlternations(0);
    startRef.current = performance.now();
    runningRef.current = true;
    setPhase("flicker");
    setShowAlt(false);

    const cycle = () => {
      if (!runningRef.current) return;
      after(flickerMs, () => {
        if (!runningRef.current) return;
        setBlank(true);
        after(blankMs, () => {
          if (!runningRef.current) return;
          setBlank(false);
          setShowAlt((v) => !v);
          setAlternations((a) => a + 1);
          cycle();
        });
      });
    };
    cycle();
  }, [gridSize, rng, after, flickerMs, blankMs]);

  const clickCell = useCallback(
    (i: number) => {
      if (phase !== "flicker" || !runningRef.current) return;
      runningRef.current = false;
      const correct = i === changedIdx;
      record({
        phase: trialN < 2 ? "practice" : "main",
        stimulus: {
          gridSize,
          changedIndex: changedIdx,
          alternations,
        },
        expected: String(changedIdx),
        response: String(i),
        correct,
        rtMs: Math.round(performance.now() - startRef.current),
      });
      if (trialN + 1 >= nTrials) {
        setPhase("done");
        complete([
          {
            label: "Mean alternations to find",
            value: "logged per trial",
            hint: "Rensink’s observers often needed 10+ alternations",
          },
        ]);
      } else {
        setTrialN((t) => t + 1);
        setPhase("ready");
      }
    },
    [phase, record, trialN, gridSize, nTrials, complete, changedIdx, alternations]
  );

  if (phase === "ready") {
    return (
      <Stage>
        <Interstitial
          eyebrow={`Scene ${trialN + 1} of ${nTrials}`}
          title={`${cols}×${cols} instrument grid`}
          body="Two versions of the grid alternate with a blank between them. One cell differs. Click it when you find it."
          action={
            <Button onClick={startTrial} autoFocus>
              Begin scene
            </Button>
          }
        />
      </Stage>
    );
  }

  if (phase === "done") return null;

  return (
    <Stage>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="grid"
        aria-label="Flickering instrument grid"
      >
        {cells.map((g, i) => (
          <button
            key={i}
            type="button"
            onClick={() => clickCell(i)}
            className="flex size-16 items-center justify-center border border-border bg-surface text-2xl text-foreground transition-colors hover:border-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:size-20"
          >
            <span style={{ opacity: blank ? 0 : 1 }}>
              {showAlt && i === changedIdx ? altGlyph : g}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-6 font-mono text-[11px] text-faint">
        alternations: {alternations}
      </p>
    </Stage>
  );
}
