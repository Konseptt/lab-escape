"use client";

import { useSyncExternalStore } from "react";
import { loadSessions, subscribeSessions, notifySessionsChanged } from "@/lib/game/history";
import type { SessionResult } from "@/lib/game/types";

let cache: SessionResult[] | null = null;

function subscribe(cb: () => void) {
  const onLocalChange = () => {
    cache = null;
    cb();
  };
  const unsubLocal = subscribeSessions(onLocalChange);
  const onStorage = () => {
    cache = null;
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    unsubLocal();
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
  notifySessionsChanged();
}
