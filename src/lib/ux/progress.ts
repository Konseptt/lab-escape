const KEY = "lab-escape:ux";

export interface UxStore {
  briefingViewed: string[];
  debriefViewed: string[];
  scienceViewed: string[];
  checklistDismissed: boolean;
}

const EMPTY: UxStore = {
  briefingViewed: [],
  debriefViewed: [],
  scienceViewed: [],
  checklistDismissed: false,
};

function read(): UxStore {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<UxStore>) };
  } catch {
    return EMPTY;
  }
}

function write(store: UxStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(store));
}

export type UxMilestone = "briefing" | "debrief" | "science";

export function markUxMilestone(type: UxMilestone, id: string) {
  const store = read();
  const field =
    type === "briefing"
      ? "briefingViewed"
      : type === "debrief"
        ? "debriefViewed"
        : "scienceViewed";
  if (!store[field].includes(id)) {
    store[field] = [...store[field], id];
    write(store);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("lab-escape:ux"));
    }
  }
}

export function dismissTrainingChecklist() {
  const store = read();
  store.checklistDismissed = true;
  write(store);
}

export function getUxStore(): UxStore {
  return read();
}

export function uxFlags() {
  const s = read();
  return {
    briefingViewed: new Set(s.briefingViewed),
    debriefViewed: new Set(s.debriefViewed),
    scienceViewed: new Set(s.scienceViewed),
    checklistDismissed: s.checklistDismissed,
  };
}
