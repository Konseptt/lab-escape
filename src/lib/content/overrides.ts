/** Admin experiment-builder overrides (local until DB write path is used). */
const KEY = "lab-escape:room-overrides";

export type RoomOverride = {
  title?: string;
  summary?: string;
  difficulty?: string;
  config?: Record<string, unknown>;
};

export function loadRoomOverrides(): Record<string, RoomOverride> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, RoomOverride>;
  } catch {
    return {};
  }
}

export function saveRoomOverride(slug: string, patch: RoomOverride) {
  if (typeof window === "undefined") return;
  const all = loadRoomOverrides();
  all[slug] = { ...all[slug], ...patch };
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getRoomOverride(slug: string): RoomOverride | undefined {
  return loadRoomOverrides()[slug];
}
