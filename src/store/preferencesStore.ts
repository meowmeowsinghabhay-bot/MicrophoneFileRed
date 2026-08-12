import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LearningLevel } from "@/lib/constants";

interface PreferencesState {
  learningLevel: LearningLevel;
  setLearningLevel: (level: LearningLevel) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      learningLevel: "standard",
      setLearningLevel: (learningLevel) => set({ learningLevel }),
    }),
    { name: "intellishala-preferences" }
  )
);
