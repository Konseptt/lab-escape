"use client";

import { useMemo } from "react";
import { useHistory } from "@/components/use-history";
import { resolveNextAction } from "@/lib/ux/journey";
import { useUxFlags } from "./use-ux-flags";

export function useNextAction() {
  const sessions = useHistory();
  const flags = useUxFlags();
  return useMemo(() => resolveNextAction(sessions, flags), [sessions, flags]);
}
