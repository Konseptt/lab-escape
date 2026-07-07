"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { useHistory } from "@/components/use-history";
import {
  buildTrainingChecklist,
  checklistProgress,
} from "@/lib/ux/journey";
import { dismissTrainingChecklist, getUxStore } from "@/lib/ux/progress";
import { useUxFlags } from "@/components/ux/use-ux-flags";
import { useHydrated } from "@/components/use-hydrated";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function TrainingChecklist() {
  const sessions = useHistory();
  const flags = useUxFlags();
  // Dismissal lives in localStorage; render nothing until hydration so SSR
  // markup and the first client render agree.
  const hydrated = useHydrated();
  const [justDismissed, setJustDismissed] = useState(false);
  const dismissed =
    !hydrated || justDismissed || getUxStore().checklistDismissed;

  const items = useMemo(
    () => buildTrainingChecklist(sessions, flags),
    [sessions, flags]
  );
  const progress = checklistProgress(items);
  const complete = progress === 100;

  if (dismissed || complete) return null;

  return (
    <section
      aria-labelledby="onboard-h"
      className="border border-border bg-background"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <p className="label-micro text-muted-foreground">First visit</p>
          <h2 id="onboard-h" className="mt-1 text-sm font-medium tracking-tight">
            Training checklist
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Four steps, in order. Skip ahead only after you finish a rep.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            dismissTrainingChecklist();
            setJustDismissed(true);
          }}
          className="text-faint hover:text-muted-foreground"
          aria-label="Dismiss checklist"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] text-faint">{progress}% complete</span>
          <Progress
            value={progress}
            className="h-1 max-w-xs flex-1 rounded-none bg-muted [&>[data-slot=progress-indicator]]:bg-primary"
          />
        </div>

        <ol className="mt-5 space-y-3">
          {items.map((item) => {
            const row = (
              <>
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center border",
                    item.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-transparent"
                  )}
                  aria-hidden="true"
                >
                  <Check className="size-3" strokeWidth={2.5} />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm",
                      item.done ? "text-muted-foreground" : "font-medium text-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-faint">{item.detail}</span>
                </span>
              </>
            );

            return (
              <li key={item.id}>
                {item.href && !item.done ? (
                  <Link
                    href={item.href}
                    className="flex gap-3 rounded-none transition-colors hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring -mx-2 px-2 py-1"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex gap-3 px-0 py-1">{row}</div>
                )}
              </li>
            );
          })}
        </ol>

        {!sessions.length ? (
          <Button asChild size="sm" className="mt-5 w-full sm:w-auto">
            <Link href="/experiments/invisible-gorilla">Start checklist</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
