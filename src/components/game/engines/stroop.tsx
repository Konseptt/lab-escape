"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEngine, usePausableTimeout } from "../use-engine";
import { Stage, Fixation, ResponseKey } from "../primitives";
import { shuffle, pick } from "@/lib/game/rng";
import { mean } from "@/lib/game/scoring";
import { useSettingsStore } from "@/stores/settings-store";
import { useGameStore } from "@/stores/game-store";

const COLORS = [
  { name: "red", hex: "#E5484D", key: "r" },
  { name: "green", hex: "#46A758", key: "g" },
  { name: "blue", hex: "#3E63DD", key: "b" },
  { name: "yellow", hex: "#D4A72C", key: "y" },
] as const;

const THREAT_WORDS = ["failure", "danger", "collapse", "threat", "panic", "crisis"];
const POSITIVE_WORDS = ["sunrise", "victory", "comfort", "delight", "warmth", "praise"];
const NEUTRAL_WORDS = ["table", "window", "paper", "corridor", "number", "fabric"];

type TrialKind = "congruent" | "incongruent" | "neutral" | "threat" | "positive";

interface StroopTrial {
  word: string;
  ink: (typeof COLORS)[number];
  kind: TrialKind;
  phase: "practice" | "main";
}

/**
 * Classic and emotional Stroop. `config.categories` switches the room from
 * response-conflict mode (color words) to attention-capture mode
 * (emotional words).
 */
export function StroopEngine({ config }: { config: Record<string, unknown> }) {
  const { rng, now, record, setObjective, setProgress, complete } = useEngine();
  const after = usePausableTimeout();
  const largeText = useSettingsStore((s) => s.largeText);

  const emotional = Array.isArray(config.categories);
  const nTrials = (config.trials as number) ?? 48;
  const nPractice = (config.practice as number) ?? 8;

  const trials = useMemo<StroopTrial[]>(() => {
    const make = (kind: TrialKind): Omit<StroopTrial, "phase"> => {
      const ink = pick(rng, COLORS);
      if (kind === "congruent") return { word: ink.name.toUpperCase(), ink, kind };
      if (kind === "incongruent") {
        const other = pick(rng, COLORS.filter((c) => c.name !== ink.name));
        return { word: other.name.toUpperCase(), ink, kind };
      }
      if (kind === "threat") return { word: pick(rng, THREAT_WORDS).toUpperCase(), ink, kind };
      if (kind === "positive") return { word: pick(rng, POSITIVE_WORDS).toUpperCase(), ink, kind };
      return {
        word: emotional ? pick(rng, NEUTRAL_WORDS).toUpperCase() : "▬▬▬▬",
        ink,
        kind: "neutral",
      };
    };
    const kinds: TrialKind[] = emotional
      ? ["neutral", "threat", "positive"]
      : ["congruent", "incongruent", "neutral"];
    const body: StroopTrial[] = [];
    for (let i = 0; i < nTrials; i++) {
      body.push({ ...make(kinds[i % kinds.length]), phase: "main" });
    }
    const practice: StroopTrial[] = [];
    for (let i = 0; i < nPractice; i++) {
      practice.push({ ...make(kinds[i % kinds.length]), phase: "practice" });
    }
    return [...shuffle(rng, practice), ...shuffle(rng, body)];
  }, [rng, emotional, nTrials, nPractice]);

  const [index, setIndex] = useState(0);
  const [showing, setShowing] = useState<"fixation" | "stimulus" | "feedback">("fixation");
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const shownAtRef = useRef(0);
  const doneRef = useRef(false);
  const trial = trials[index];

  useEffect(() => {
    setObjective(
      trial?.phase === "practice"
        ? "Practice: press the key matching the INK color"
        : "Name the ink, not the word"
    );
  }, [trial?.phase, setObjective]);

  useEffect(() => {
    setProgress(index / trials.length);
  }, [index, trials.length, setProgress]);

  // fixation -> stimulus
  useEffect(() => {
    if (showing !== "fixation" || doneRef.current) return;
    after(450 + Math.floor(rng() * 250), () => {
      shownAtRef.current = now();
      setShowing("stimulus");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, showing]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const recorded = useGameStore.getState().trials;
    complete(stroopHighlights(recorded));
  }, [complete]);

  const respond = useCallback(
    (colorName: string) => {
      if (showing !== "stimulus" || !trial || doneRef.current) return;
      const rt = now() - shownAtRef.current;
      const correct = colorName === trial.ink.name;
      record({
        phase: trial.phase,
        stimulus: { word: trial.word, ink: trial.ink.name, kind: trial.kind },
        expected: trial.ink.name,
        response: colorName,
        correct,
        rtMs: rt,
      });
      setLastCorrect(correct);
      setShowing("feedback");
      after(trial.phase === "practice" ? 550 : 260, () => {
        setLastCorrect(null);
        if (index + 1 >= trials.length) {
          finish();
        } else {
          setIndex((i) => i + 1);
          setShowing("fixation");
        }
      });
    },
    [showing, trial, now, record, after, index, trials.length, finish]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const c = COLORS.find((c) => c.key === e.key.toLowerCase());
      if (c) respond(c.name);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [respond]);

  return (
    <Stage>
      <div className="flex h-44 items-center justify-center" aria-live="polite">
        {showing === "fixation" ? (
          <Fixation />
        ) : showing === "feedback" && trial?.phase === "practice" ? (
          <p
            className={`font-mono text-sm ${lastCorrect ? "text-success" : "text-destructive"}`}
          >
            {lastCorrect ? "correct" : "the ink color, not the word"}
          </p>
        ) : showing === "stimulus" && trial ? (
          <span
            className={`select-none font-medium tracking-tight ${largeText ? "text-8xl" : "text-7xl"}`}
            style={{ color: trial.ink.hex }}
          >
            {trial.word}
          </span>
        ) : null}
      </div>

      <div className="mt-16 flex gap-3">
        {COLORS.map((c) => (
          <ResponseKey
            key={c.name}
            label={c.name}
            keycap={c.key}
            swatch={c.hex}
            onPress={() => respond(c.name)}
            disabled={showing !== "stimulus"}
          />
        ))}
      </div>
      <p className="mt-8 font-mono text-[11px] text-faint">
        trial {Math.min(index + 1, trials.length)} / {trials.length}
        {trial?.phase === "practice" ? " · practice" : ""}
      </p>
    </Stage>
  );
}

/** Post-hoc highlight builder used by the play page when the engine completes. */
export function stroopHighlights(
  trials: { stimulus: Record<string, unknown>; correct: boolean | null; rtMs: number | null; phase: string }[]
) {
  const rt = (kind: string) =>
    mean(
      trials
        .filter(
          (t) =>
            t.phase === "main" &&
            t.correct &&
            t.rtMs !== null &&
            (t.stimulus.kind as string) === kind
        )
        .map((t) => t.rtMs as number)
    );
  const baseline = rt("congruent") || rt("neutral");
  const conflict = rt("incongruent") || rt("threat");
  const interference = Math.round(conflict - baseline);
  if (!baseline || !conflict) return [];
  return [
    {
      label: "Interference cost",
      value: `${interference > 0 ? "+" : ""}${interference} ms`,
      hint: "Stroop’s 1935 participants: roughly +74% on naming time",
    },
  ];
}
