import type { SessionResult } from "./types";

/**
 * Session history.
 *
 * Results are written to localStorage first (source of truth for guests and
 * offline kiosks), then mirrored to the API when a database is available.
 * The results and analytics pages read from this layer, so the whole play
 * loop works with zero backend.
 */
const KEY = "lab-escape:sessions";
const MAX = 200;

export function loadSessions(): SessionResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionResult[]) : [];
  } catch {
    return [];
  }
}

export function loadSession(id: string): SessionResult | undefined {
  return loadSessions().find((s) => s.id === id);
}

export function saveSession(result: SessionResult) {
  if (typeof window === "undefined") return;
  try {
    const sessions = [result, ...loadSessions()].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    // Quota exceeded, drop oldest half and retry once.
    try {
      const sessions = [result, ...loadSessions().slice(0, MAX / 2)];
      window.localStorage.setItem(KEY, JSON.stringify(sessions));
    } catch {
      /* give up silently; the API mirror may still succeed */
    }
  }

  void fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  }).catch(() => {
    /* offline / no db, localStorage copy remains authoritative */
  });
}

export function completedRoomSlugs(): Set<string> {
  return new Set(loadSessions().map((s) => s.roomSlug));
}

export function totalXp(): number {
  return loadSessions().reduce((sum, s) => sum + Math.round(s.score / 10), 0);
}
