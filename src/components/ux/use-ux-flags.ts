"use client";

import { useEffect, useState } from "react";
import { uxFlags } from "@/lib/ux/progress";

type UxFlagSet = ReturnType<typeof uxFlags>;

export function useUxFlags(): UxFlagSet {
  // Empty defaults for SSR and the first client render; the stored flags are
  // read after mount to avoid hydration mismatches.
  const [flags, setFlags] = useState<UxFlagSet>(() => ({
    briefingViewed: new Set<string>(),
    debriefViewed: new Set<string>(),
    scienceViewed: new Set<string>(),
    checklistDismissed: false,
  }));

  useEffect(() => {
    const refresh = () => setFlags(uxFlags());
    refresh();
    window.addEventListener("lab-escape:ux", refresh);
    return () => window.removeEventListener("lab-escape:ux", refresh);
  }, []);

  return flags;
}
