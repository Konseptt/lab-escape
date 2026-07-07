"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, CornerDownLeft } from "lucide-react";
import { useEngine, usePausableTimeout } from "../use-engine";
import { Stage, Interstitial } from "../primitives";
import { useGameStore } from "@/stores/game-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Button } from "@/components/ui/button";

const SYMBOLS = ["△", "◯", "▢", "◇", "✕", "⬡", "＋", "≡", "⌘"] as const;

type Phase = "ready" | "present" | "recall" | "done";

/**
 * Adaptive symbol span (Miller / digit-span paradigm).
 * Staircase: correct recall lengthens the next sequence, an error shortens it.
 */
export function SpanEngine({ config }: { config: Record<string, unknown> }) {
  const { rng, now, record, setObjective, setProgress, complete } = useEngine();
  const after = usePausableTimeout();
  const largeText = useSettingsStore((s) => s.largeText);

  const startLength = (config.startLength as number) ?? 3;
  const maxLength = (config.maxLength as number) ?? 12;
  const totalTrials = (config.trials as number) ?? 14;
  const itemMs = (config.itemMs as number) ?? 800;
  const isiMs = (config.isiMs as number) ?? 250;

  const [phase, setPhase] = useState<Phase>("ready");
  const [trialN, setTrialN] = useState(0);
  const [length, setLength] = useState(startLength);
  const [sequence, setSequence] = useState<string[]>([]);
  const [presentIdx, setPresentIdx] = useState(-1);
  const [entry, setEntry] = useState<string[]>([]);
  const bestRef = useRef(0);
  const recallStartRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setObjective("Memorize the sequence, then reproduce it");
  }, [setObjective]);
  useEffect(() => {
    setProgress(trialN / totalTrials);
  }, [trialN, totalTrials, setProgress]);

  const startTrial = useCallback(() => {
    const seq = Array.from(
      { length },
      () => SYMBOLS[Math.floor(rng() * SYMBOLS.length)]
    );
    setSequence(seq);
    setEntry([]);
    setPhase("present");
    setPresentIdx(-1);

    // Present items one by one with pause-aware timing.
    const step = (i: number) => {
      if (i >= seq.length) {
        setPresentIdx(-1);
        after(300, () => {
          recallStartRef.current = now();
          setPhase("recall");
        });
        return;
      }
      setPresentIdx(i);
      after(itemMs, () => {
        setPresentIdx(-2); // blank ISI
        after(isiMs, () => step(i + 1));
      });
    };
    after(500, () => step(0));
  }, [length, rng, after, itemMs, isiMs, now]);

  const submit = useCallback(() => {
    if (phase !== "recall" || doneRef.current) return;
    const correct = entry.join("") === sequence.join("");
    if (correct) bestRef.current = Math.max(bestRef.current, sequence.length);
    record({
      phase: trialN < 2 ? "practice" : "main",
      stimulus: { sequence, length: sequence.length },
      expected: sequence.join(""),
      response: entry.join(""),
      correct,
      rtMs: now() - recallStartRef.current,
    });

    const nextLen = Math.max(
      startLength,
      Math.min(maxLength, length + (correct ? 1 : -1))
    );
    setLength(nextLen);

    if (trialN + 1 >= totalTrials) {
      doneRef.current = true;
      setPhase("done");
      complete([
        {
          label: "Symbol span",
          value: String(bestRef.current),
          hint: "Miller’s classic estimate: 7 ± 2 items",
        },
      ]);
    } else {
      setTrialN((t) => t + 1);
      setPhase("ready");
    }
  }, [
    phase, entry, sequence, record, trialN, now, startLength, maxLength,
    length, totalTrials, complete,
  ]);

  // Keyboard: number keys 1-9 map to the symbol pad, backspace, enter.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "recall") return;
      const n = Number(e.key);
      if (n >= 1 && n <= SYMBOLS.length && entry.length < sequence.length) {
        setEntry((prev) => [...prev, SYMBOLS[n - 1]]);
      } else if (e.key === "Backspace") {
        setEntry((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter" && entry.length === sequence.length) {
        submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, entry.length, sequence.length, submit]);

  const hintsUsed = useGameStore((s) => s.hintsUsed);
  void hintsUsed;

  if (phase === "ready") {
    return (
      <Stage>
        <Interstitial
          eyebrow={`Sequence ${trialN + 1} of ${totalTrials}`}
          title={`${length} symbols`}
          body={
            trialN < 2
              ? "Practice round. Symbols appear one at a time, reproduce the order using the pad or keys 1–9."
              : undefined
          }
          action={
            <Button onClick={startTrial} autoFocus>
              Present sequence
            </Button>
          }
        />
      </Stage>
    );
  }

  return (
    <Stage>
      {/* Presentation area */}
      <div className="flex h-40 items-center justify-center" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {phase === "present" && presentIdx >= 0 ? (
            <motion.span
              key={`${presentIdx}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className={`select-none ${largeText ? "text-8xl" : "text-7xl"} text-foreground`}
            >
              {sequence[presentIdx]}
            </motion.span>
          ) : phase === "recall" ? (
            <motion.div
              key="recall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              {sequence.map((_, i) => (
                <span
                  key={i}
                  className={`flex size-11 items-center justify-center border text-2xl ${
                    entry[i]
                      ? "border-faint text-foreground"
                      : "border-border text-transparent"
                  }`}
                >
                  {entry[i] ?? "·"}
                </span>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Recall pad */}
      <div
        className={`mt-12 grid grid-cols-3 gap-2 transition-opacity ${
          phase === "recall" ? "opacity-100" : "pointer-events-none opacity-20"
        }`}
      >
        {SYMBOLS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() =>
              entry.length < sequence.length && setEntry((p) => [...p, s])
            }
            className="flex size-14 flex-col items-center justify-center border border-border bg-surface text-2xl transition-colors hover:border-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {s}
            <span className="font-mono text-[9px] text-faint">{i + 1}</span>
          </button>
        ))}
      </div>
      <div
        className={`mt-4 flex gap-2 transition-opacity ${
          phase === "recall" ? "opacity-100" : "pointer-events-none opacity-20"
        }`}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setEntry((p) => p.slice(0, -1))}
          disabled={entry.length === 0}
        >
          <Delete className="size-3.5" /> Undo
        </Button>
        <Button
          size="sm"
          onClick={submit}
          disabled={entry.length !== sequence.length}
        >
          <CornerDownLeft className="size-3.5" /> Submit
        </Button>
      </div>
    </Stage>
  );
}
