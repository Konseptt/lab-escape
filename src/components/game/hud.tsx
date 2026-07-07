"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Lightbulb, Accessibility, X, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * The entire in-game chrome. Objective, progress hairline, inventory, and four controls.
 * Everything else is stimulus.
 */
export function GameHud({ hint, roomCode }: { hint: string; roomCode: string }) {
  const router = useRouter();
  const { objective, progress, phase, pause, resume, spendHint, hintsUsed, inventory, reset } =
    useGameStore();
  const settings = useSettingsStore();
  const [hintOpen, setHintOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const hintSeenRef = useRef(false);
  const paused = phase === "paused";

  return (
    <>
      {/* Progress hairline, the only persistent measurement on screen */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Session progress"
        className="fixed inset-x-0 top-0 z-50 h-px bg-border"
      >
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.14em] text-faint">
            {roomCode}
          </span>
          <span aria-live="polite" className="text-[0.8125rem] text-muted-foreground">
            {objective}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              onClick={() => setInventoryOpen(true)}
              aria-label={`Inventory, ${inventory.length} item${inventory.length === 1 ? "" : "s"}`}
              className="relative flex size-8 items-center justify-center text-faint transition-colors hover:text-foreground"
            >
              <Archive className="size-4" strokeWidth={1.75} />
              {inventory.length > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center bg-primary font-mono text-[9px] text-primary-foreground">
                  {inventory.length}
                </span>
              ) : null}
            </TooltipTrigger>
            <TooltipContent>Inventory</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={() => {
                // The hint text is static per room: charge it once per session.
                if (!hintSeenRef.current) {
                  hintSeenRef.current = true;
                  spendHint();
                }
                setHintOpen(true);
              }}
              aria-label="Request a hint"
              className="flex size-8 items-center justify-center text-faint transition-colors hover:text-foreground"
            >
              <Lightbulb className="size-4" strokeWidth={1.75} />
            </TooltipTrigger>
            <TooltipContent>Hint {hintsUsed > 0 ? `(${hintsUsed} used)` : ""}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={() => setA11yOpen(true)}
              aria-label="Accessibility options"
              className="flex size-8 items-center justify-center text-faint transition-colors hover:text-foreground"
            >
              <Accessibility className="size-4" strokeWidth={1.75} />
            </TooltipTrigger>
            <TooltipContent>Accessibility</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={() => (paused ? resume() : pause())}
              aria-label={paused ? "Resume" : "Pause"}
              className="flex size-8 items-center justify-center text-faint transition-colors hover:text-foreground"
            >
              {paused ? (
                <Play className="size-4" strokeWidth={1.75} />
              ) : (
                <Pause className="size-4" strokeWidth={1.75} />
              )}
            </TooltipTrigger>
            <TooltipContent>{paused ? "Resume" : "Pause"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={() => setExitOpen(true)}
              aria-label="Exit session"
              className="flex size-8 items-center justify-center text-faint transition-colors hover:text-foreground"
            >
              <X className="size-4" strokeWidth={1.75} />
            </TooltipTrigger>
            <TooltipContent>Exit</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Pause veil */}
      <AnimatePresence>
        {paused ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-background/92 backdrop-blur-sm"
          >
            <div className="text-center">
              <p className="label-micro text-primary">Paused</p>
              <p className="text-display mt-4 text-4xl">Session on hold</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Timing is suspended. Data already collected is safe.
              </p>
              <Button className="mt-8" onClick={resume} autoFocus>
                <Play className="size-4" /> Resume
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Inventory */}
      <Dialog open={inventoryOpen} onOpenChange={setInventoryOpen}>
        <DialogContent className="max-w-sm border-border bg-raised">
          <DialogHeader>
            <DialogTitle className="text-base">Inventory</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Evidence and tools collected in this room. Nothing here affects scoring.
            </DialogDescription>
          </DialogHeader>
          {inventory.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Empty.</p>
          ) : (
            <ul className="divide-y divide-border border border-border">
              {inventory.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Hint */}
      <Dialog open={hintOpen} onOpenChange={setHintOpen}>
        <DialogContent className="max-w-sm border-border bg-raised">
          <DialogHeader>
            <DialogTitle className="text-base">Hint</DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
              {hint}
            </DialogDescription>
          </DialogHeader>
          <p className="text-[11px] text-faint">
            Hints are logged with your session, researchers see assistance levels.
          </p>
        </DialogContent>
      </Dialog>

      {/* Accessibility quick panel */}
      <Dialog open={a11yOpen} onOpenChange={setA11yOpen}>
        <DialogContent className="max-w-sm border-border bg-raised">
          <DialogHeader>
            <DialogTitle className="text-base">Accessibility</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Changes apply immediately and persist to your settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {(
              [
                ["reducedMotion", "Reduce motion"],
                ["highContrast", "High contrast stimuli"],
                ["largeText", "Larger stimulus text"],
                ["colorblindSafe", "Colorblind-safe palette"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={`a11y-${key}`} className="text-sm font-normal">
                  {label}
                </Label>
                <Switch
                  id={`a11y-${key}`}
                  checked={settings[key]}
                  onCheckedChange={(v) => settings.set(key, v)}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Exit confirm */}
      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent className="max-w-sm border-border bg-raised">
          <DialogHeader>
            <DialogTitle className="text-base">Exit session?</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              This run will be discarded and its trials are not saved. The room
              can be re-entered at any time for a fresh attempt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setExitOpen(false)}>
              Stay
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                reset();
                router.push("/labs");
              }}
            >
              Exit to Lab Map
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
