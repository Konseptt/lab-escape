"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEngine, usePausableTimeout } from "../use-engine";
import { Stage, Interstitial } from "../primitives";
import { shuffle } from "@/lib/game/rng";
import { Button } from "@/components/ui/button";

interface DrmList {
  lure: string;
  words: string[];
}

const LISTS: DrmList[] = [
  { lure: "sleep", words: ["bed", "rest", "awake", "tired", "dream", "blanket", "doze", "snore"] },
  { lure: "chair", words: ["table", "sit", "legs", "seat", "couch", "desk", "recliner", "wood"] },
  { lure: "doctor", words: ["nurse", "sick", "medicine", "health", "hospital", "patient", "stethoscope", "clinic"] },
  { lure: "cold", words: ["hot", "snow", "warm", "winter", "ice", "chilly", "frost", "shiver"] },
  { lure: "needle", words: ["thread", "pin", "sewing", "sharp", "point", "prick", "thimble", "haystack"] },
  { lure: "music", words: ["note", "sound", "piano", "sing", "melody", "band", "horn", "concert"] },
];

const UNRELATED = ["lantern", "gravel", "harbor", "pencil", "meadow", "copper", "ladder", "vault", "ribbon", "engine", "canvas", "marble"];

type Phase = "ready" | "study" | "distractor" | "test" | "done";

/** DRM false-memory paradigm: study associate lists, then old/new recognition. */
export function DrmEngine({ config }: { config: Record<string, unknown> }) {
  const { rng, record, setObjective, setProgress, complete } = useEngine();
  const after = usePausableTimeout();

  const nLists = Math.min((config.lists as number) ?? 4, LISTS.length);
  const studyMs = (config.studyMs as number) ?? 1100;

  const lists = useMemo(() => shuffle(rng, LISTS).slice(0, nLists), [rng, nLists]);
  const studied = useMemo(() => lists.flatMap((l) => l.words), [lists]);
  const testSet = useMemo(() => {
    const oldItems = shuffle(rng, studied).slice(0, 12).map((w) => ({ w, type: "studied" as const }));
    const lures = lists.map((l) => ({ w: l.lure, type: "lure" as const }));
    const foils = shuffle(rng, UNRELATED).slice(0, 8).map((w) => ({ w, type: "foil" as const }));
    return shuffle(rng, [...oldItems, ...lures, ...foils]);
  }, [rng, studied, lists]);

  const [phase, setPhase] = useState<Phase>("ready");
  const [listIdx, setListIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(-1);
  const [testIdx, setTestIdx] = useState(0);
  const shownAtRef = useRef(0);
  const luresRejectedRef = useRef(0);

  useEffect(() => {
    setObjective(
      phase === "study"
        ? "Memorize the evidence lists"
        : phase === "test"
          ? "OLD if you studied it, NEW if you did not"
          : "Study, then testify"
    );
  }, [phase, setObjective]);

  useEffect(() => {
    const total = nLists + testSet.length;
    const done = phase === "test" ? nLists + testIdx : phase === "study" ? listIdx : 0;
    setProgress(done / total);
  }, [phase, listIdx, testIdx, nLists, testSet.length, setProgress]);

  const startStudy = useCallback(() => {
    setPhase("study");
    const runList = (li: number) => {
      setListIdx(li);
      const words = lists[li].words;
      const step = (wi: number) => {
        if (wi >= words.length) {
          setWordIdx(-1);
          if (li + 1 < lists.length) {
            after(900, () => runList(li + 1));
          } else {
            after(900, () => setPhase("distractor"));
          }
          return;
        }
        setWordIdx(wi);
        after(studyMs, () => step(wi + 1));
      };
      after(600, () => step(0));
    };
    runList(0);
  }, [lists, after, studyMs]);

  const respond = useCallback(
    (saysOld: boolean) => {
      const item = testSet[testIdx];
      const isOld = item.type === "studied";
      const correct = saysOld === isOld;
      if (item.type === "lure" && !saysOld) luresRejectedRef.current += 1;
      record({
        phase: "main",
        stimulus: { word: item.w, type: item.type },
        expected: isOld ? "old" : "new",
        response: saysOld ? "old" : "new",
        correct,
        rtMs: Math.round(performance.now() - shownAtRef.current),
      });
      if (testIdx + 1 >= testSet.length) {
        setPhase("done");
        complete([
          {
            label: "Critical lures rejected",
            value: `${luresRejectedRef.current} / ${nLists}`,
            hint: "Roediger & McDermott: lures falsely recognized ~50% of the time",
          },
        ]);
      } else {
        shownAtRef.current = performance.now();
        setTestIdx((i) => i + 1);
      }
    },
    [testSet, testIdx, record, nLists, complete]
  );

  useEffect(() => {
    if (phase === "test") shownAtRef.current = performance.now();
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "test") return;
      if (e.key.toLowerCase() === "o") respond(true);
      if (e.key.toLowerCase() === "n") respond(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, respond]);

  if (phase === "ready") {
    return (
      <Stage>
        <Interstitial
          eyebrow="Evidence review"
          title={`${nLists} evidence lists`}
          body="Words appear one at a time. Memorize them, you will testify about exactly what you saw."
          action={
            <Button onClick={startStudy} autoFocus>
              Open the archive
            </Button>
          }
        />
      </Stage>
    );
  }

  if (phase === "study") {
    return (
      <Stage>
        <p className="label-micro mb-10 text-faint">
          List {listIdx + 1} of {nLists}
        </p>
        <div className="flex h-32 items-center justify-center">
          <AnimatePresence mode="popLayout">
            {wordIdx >= 0 ? (
              <motion.span
                key={wordIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-5xl font-medium tracking-tight"
              >
                {lists[listIdx].words[wordIdx]}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </Stage>
    );
  }

  if (phase === "distractor") {
    return (
      <Stage>
        <Interstitial
          eyebrow="Interference"
          title="Count backwards from 30 by threes"
          body="Out loud or in your head: 30, 27, 24… This clears rehearsal before the test."
          action={
            <Button onClick={() => setPhase("test")} autoFocus>
              I&apos;m ready to testify
            </Button>
          }
        />
      </Stage>
    );
  }

  if (phase === "done") return null;

  return (
    <Stage>
      <p className="label-micro mb-10 text-faint">
        Item {testIdx + 1} of {testSet.length}
      </p>
      <div className="flex h-28 items-center justify-center">
        <span className="text-5xl font-medium tracking-tight">
          {testSet[testIdx].w}
        </span>
      </div>
      <div className="mt-12 flex gap-3">
        <Button variant="secondary" size="lg" onClick={() => respond(false)}>
          New <span className="ml-1 font-mono text-[10px] text-faint">N</span>
        </Button>
        <Button size="lg" onClick={() => respond(true)}>
          Old <span className="ml-1 font-mono text-[10px] opacity-70">O</span>
        </Button>
      </div>
    </Stage>
  );
}
