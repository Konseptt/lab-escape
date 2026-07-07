"use client";

import { useSyncExternalStore } from "react";
import { loadSessions } from "@/lib/game/history";
import type { SessionResult } from "@/lib/game/types";

let cache: SessionResult[] | null = null;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => {
    cache = null;
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): SessionResult[] {
  if (cache === null) cache = loadSessions();
  return cache;
}

const EMPTY: SessionResult[] = [];
function getServerSnapshot() {
  return EMPTY;
}

/**
 * Local session history (guest-first storage layer). SSR-safe: renders empty
 * on the server, hydrates with localStorage contents on the client.
 */
export function useHistory(): SessionResult[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function invalidateHistory() {
  cache = null;
  listeners.forEach((l) => l());
}
