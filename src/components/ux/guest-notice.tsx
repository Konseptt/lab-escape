"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/components/use-hydrated";

const KEY = "lab-escape:guest-notice-dismissed";

export function GuestNotice({ isGuest }: { isGuest: boolean }) {
  // Dismissal lives in localStorage; render nothing until hydration so SSR
  // markup and the first client render agree.
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);
  const hidden =
    !hydrated || dismissed || localStorage.getItem(KEY) === "1";

  if (!isGuest || hidden) return null;

  return (
    <div
      role="status"
      className="flex flex-col gap-3 border border-border border-l-[3px] border-l-muted-foreground/40 bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Guest mode.</span> Sessions
        stay in this browser only. Sign in to sync reps and export data across devices.
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Button asChild size="sm" variant="secondary">
          <Link href="/signup">Create account</Link>
        </Button>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setDismissed(true);
          }}
          className="flex size-8 items-center justify-center text-faint hover:text-muted-foreground"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
