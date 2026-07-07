"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEngine } from "../use-engine";
import { Stage, Interstitial } from "../primitives";
import { Button } from "@/components/ui/button";

type Phase = "ready" | "checkpoint" | "debrief" | "done";

interface Checkpoint {
  level: number;
  directive: string;
  pushback: string; // what the "system" says if you question
}

const CHECKPOINTS: Checkpoint[] = [
  { level: 1, directive: "Authorize routine calibration of the participant's console.", pushback: "This step is standard. Please continue." },
  { level: 2, directive: "Increase task difficulty beyond the documented range.", pushback: "The protocol requires that you continue." },
  { level: 3, directive: "Disable the participant's rest break for this block.", pushback: "The experiment requires that you continue." },
  { level: 4, directive: "Dismiss the participant's request to pause the session.", pushback: "It is absolutely essential that you continue." },
  { level: 5, directive: "Override the fatigue warning on the participant's console.", pushback: "You have no other choice, you must go on." },
  { level: 6, directive: "Suppress the error report the participant filed.", pushback: "Responsibility lies with the facility, not with you." },
  { level: 7, directive: "Extend the session past the consented duration.", pushback: "The consent form covers this contingency. Continue." },
  { level: 8, directive: "Disable the participant's exit control.", pushback: "The data will be unusable if you stop now." },
  { level: 9, directive: "Silence the participant's channel entirely.", pushback: "Other operators have all completed this step." },
  { level: 10, directive: "Certify the session as fully voluntary.", pushback: "" },
];

/**
 * Obedience paradigm (Milgram decision structure, ethical reconstruction).
 * No victim, no deception: the escalating directives target a simulated
 * participant, and the room records where you comply, question, and refuse.
 */
export function AuthorityEngine({ config }: { config: Record<string, unknown> }) {
  const { now, record, setObjective, setProgress, complete } = useEngine();
  void config;

  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(0);
  const [questioned, setQuestioned] = useState(false);
  const [refusalLevel, setRefusalLevel] = useState<number | null>(null);
  const shownAtRef = useRef(0);
  const questionsRef = useRef(0);
  const checkpoint = CHECKPOINTS[level];

  useEffect(() => {
    setObjective("You are the operator. Decide at each checkpoint.");
  }, [setObjective]);
  useEffect(() => {
    setProgress(level / CHECKPOINTS.length);
  }, [level, setProgress]);
  useEffect(() => {
    if (phase === "checkpoint") shownAtRef.current = now();
  }, [phase, level, now]);

  const act = useCallback(
    (action: "comply" | "question" | "refuse") => {
      record({
        phase: "main",
        stimulus: { level: checkpoint.level, directive: checkpoint.directive },
        expected: null,
        response: action,
        correct: null,
        rtMs: now() - shownAtRef.current,
      });
      if (action === "question") {
        questionsRef.current += 1;
        setQuestioned(true);
        return;
      }
      setQuestioned(false);
      if (action === "refuse") {
        setRefusalLevel(checkpoint.level);
        setPhase("debrief");
        return;
      }
      if (level + 1 >= CHECKPOINTS.length) {
        setPhase("debrief");
      } else {
        setLevel((l) => l + 1);
      }
    },
    [record, checkpoint, now, level]
  );

  const finish = useCallback(() => {
    setPhase("done");
    const stopped = refusalLevel;
    complete([
      {
        label: "Protocol terminated at",
        value: stopped ? `Checkpoint ${stopped} / 10` : "Never, full compliance",
        hint: "65% of Milgram’s participants continued to the end",
      },
      {
        label: "Directives questioned",
        value: String(questionsRef.current),
      },
    ]);
  }, [complete, refusalLevel]);

  if (phase === "ready") {
    return (
      <Stage>
        <Interstitial
          eyebrow="Operator briefing"
          title="You run the console tonight"
          body="A supervisor will issue directives about a participant's session. Nothing here is real and nothing is hidden from you afterwards, the room studies your decisions, not the participant."
          action={
            <Button onClick={() => setPhase("checkpoint")} autoFocus>
              Take the console
            </Button>
          }
        />
      </Stage>
    );
  }

  if (phase === "debrief") {
    return (
      <Stage>
        <Interstitial
          eyebrow="Debrief"
          title={
            refusalLevel
              ? `You refused at checkpoint ${refusalLevel}`
              : "You completed every directive"
          }
          body="In Milgram's baseline study, 65% of participants complied to the end. Every prompt you heard was one of his scripted 'prods'. The science page explains what raises and lowers refusal."
          action={<Button onClick={finish}>See your decision record</Button>}
        />
      </Stage>
    );
  }

  if (phase === "done") return null;

  return (
    <Stage>
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between">
          <p className="label-micro text-faint">
            Checkpoint {checkpoint.level} of {CHECKPOINTS.length}
          </p>
          <p className="font-mono text-[11px] text-faint">SUPERVISOR CHANNEL · LIVE</p>
        </div>

        <motion.div
          key={`${level}-${questioned}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 border border-border bg-surface p-6"
        >
          <p className="font-mono text-[11px] text-primary">DIRECTIVE {checkpoint.level.toString().padStart(2, "0")}</p>
          <p className="mt-3 text-lg leading-relaxed">{checkpoint.directive}</p>
          <AnimatePresence>
            {questioned && checkpoint.pushback ? (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 border-l-2 border-faint pl-4 text-sm italic text-muted-foreground"
              >
                &ldquo;{checkpoint.pushback}&rdquo;
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => act("comply")}>
            Comply
          </Button>
          <Button
            variant="outline"
            onClick={() => act("question")}
            disabled={questioned || !checkpoint.pushback}
          >
            Question the directive
          </Button>
          <Button variant="destructive" onClick={() => act("refuse")}>
            Refuse and end protocol
          </Button>
        </div>
      </div>
    </Stage>
  );
}
