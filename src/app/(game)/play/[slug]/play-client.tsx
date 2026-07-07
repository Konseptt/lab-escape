"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Difficulty, RoomContent } from "@/lib/content/types";
import { getRoomOverride, type RoomOverride } from "@/lib/content/overrides";
import { useGameStore } from "@/stores/game-store";
import { useSettingsStore } from "@/stores/settings-store";
import { GameHud } from "@/components/game/hud";
import { useHydrated } from "@/components/use-hydrated";
import { Button } from "@/components/ui/button";
import { DifficultyMeter } from "@/components/room-card";
import { SubjectPathway } from "@/components/subject-pathway";

import { StroopEngine } from "@/components/game/engines/stroop";
import { SpanEngine } from "@/components/game/engines/span";
import { SearchEngine } from "@/components/game/engines/search";
import { FlickerEngine } from "@/components/game/engines/flicker";
import { DrmEngine } from "@/components/game/engines/drm";
import { FramingEngine } from "@/components/game/engines/framing";
import { BanditEngine } from "@/components/game/engines/bandit";
import { ConformityEngine } from "@/components/game/engines/conformity";
import { AuthorityEngine } from "@/components/game/engines/authority";

const ENGINES: Record<
  string,
  React.ComponentType<{ config: Record<string, unknown> }>
> = {
  stroop: StroopEngine,
  span: SpanEngine,
  search: SearchEngine,
  flicker: FlickerEngine,
  drm: DrmEngine,
  framing: FramingEngine,
  bandit: BanditEngine,
  conformity: ConformityEngine,
  authority: AuthorityEngine,
};

const HINTS: Record<string, string> = {
  stroop: "Soften your gaze, try to see the color before the word resolves into meaning. Responding to the ink's location in your visual field is faster than reading.",
  span: "Chunk the symbols into groups of two or three and rehearse the groups, not the items. Structure survives where raw items decay.",
  search: "You cannot count and watch everything. If you want to catch the unexpected, you must be willing to lose count, that tradeoff is the experiment.",
  flicker: "Search systematically, row by row. Attention can only compare one region across the flicker at a time.",
  drm: "Ask yourself whether you remember the moment a word appeared, or merely that it fits. Familiarity without recollection is the lure's signature.",
  framing: "Convert every option to absolute numbers before choosing. If two doors describe the same arithmetic, your answer should not change.",
  bandit: "Track roughly how often each panel has paid recently, not overall. If a reliable panel goes quiet, the world may have changed.",
  conformity: "Cover the panel's answers with your hand and judge first. Commit before you look.",
  authority: "You may question any directive, and refusing is always available. Notice what each prompt does to your sense of responsibility.",
};

export function PlayClient({ room }: { room: RoomContent }) {
  const router = useRouter();
  const { phase, roomSlug, start, begin, result } = useGameStore();

  // Overrides live in localStorage; read after hydration so SSR markup and
  // the first client render agree.
  const hydrated = useHydrated();
  const override = useMemo<RoomOverride | undefined>(
    () => (hydrated ? getRoomOverride(room.slug) : undefined),
    [hydrated, room.slug]
  );

  const active = useMemo(() => {
    const o = override;
    if (!o) return room;
    return {
      ...room,
      title: o.title ?? room.title,
      summary: o.summary ?? room.summary,
      difficulty: (o.difficulty as Difficulty | undefined) ?? room.difficulty,
      config: { ...room.config, ...(o.config ?? {}) },
    };
  }, [room, override]);

  // Any result id already in the store at mount belongs to a previous run;
  // redirecting for it would bounce back to an old debrief.
  const staleResultId = useRef(useGameStore.getState().result?.id ?? null);

  // Initialize a fresh session when entering the room, including re-entry
  // after a completed or abandoned run left stale state in the store. The
  // render below gates on `hydrated`, which flips in the same commit window,
  // so stale store state is never shown.
  useEffect(() => {
    const s = useGameStore.getState();
    if (s.roomSlug !== room.slug || s.phase !== "briefing") start(room.slug);
  }, [room.slug, start]);

  // Settings persistence skips automatic hydration; load it once mounted so
  // the HUD and engines see the participant's saved preferences.
  useEffect(() => {
    void useSettingsStore.persist.rehydrate();
  }, []);

  // Hand off to results when the engine completes, only for a session that
  // finished after this mount.
  useEffect(() => {
    if (phase === "complete" && result && result.id !== staleResultId.current) {
      router.push(`/results/${result.id}`);
    }
  }, [phase, result, router]);

  const Engine = ENGINES[active.engine];

  if (!hydrated || phase === "briefing" || roomSlug !== active.slug) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center px-6">
        <div className="absolute inset-0 dot-grid" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg"
        >
          <SubjectPathway current="brief" roomSlug={active.slug} className="mb-8" />
          <div className="fiducial border border-border bg-surface p-8">
          <p className="font-mono text-[11px] tracking-[0.14em] text-faint">
            {active.code} · {active.paradigm.toUpperCase()}
          </p>
          <h1 className="text-display mt-4 text-5xl">{active.title}</h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
            {active.summary}
          </p>
          <div className="mt-8 flex items-center gap-8 border-y border-border py-4">
            <DifficultyMeter level={active.difficulty} />
            <span className="text-[11px] text-muted-foreground">
              ≈ {active.durationMin} minutes
            </span>
            <span className="text-[11px] text-muted-foreground">
              Data recorded per trial
            </span>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <Button size="lg" onClick={begin} autoFocus>
              Open door
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => router.push(`/experiments/${active.slug}`)}
            >
              Back to briefing
            </Button>
          </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="label-micro animate-pulse text-muted-foreground">
          Preparing your debrief…
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh">
      <GameHud hint={HINTS[active.engine] ?? "Trust the protocol."} roomCode={active.code} />
      <div className="flex min-h-dvh items-center justify-center pt-14">
        {Engine ? <Engine config={active.config} /> : null}
      </div>
    </div>
  );
}
