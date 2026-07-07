import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  colorblindSafe: boolean;
  keyboardOnly: boolean;
  sound: boolean;
  hints: boolean;
  researchMode: boolean;
  anonymousData: boolean;
  shareAnalytics: boolean;
  language: string;
  set: <K extends keyof Omit<SettingsState, "set">>(
    key: K,
    value: SettingsState[K]
  ) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      colorblindSafe: false,
      keyboardOnly: false,
      sound: true,
      hints: true,
      researchMode: false,
      anonymousData: true,
      shareAnalytics: true,
      language: "en",
      set: (key, value) => set({ [key]: value }),
    }),
    { name: "lab-escape:settings" }
  )
);
