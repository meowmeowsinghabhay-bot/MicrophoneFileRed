import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LearningLevel } from "@/lib/constants";

interface PreferencesState {
  learningLevel: LearningLevel;
  selectedCourseId: string | null;
  setLearningLevel: (level: LearningLevel) => void;
  setSelectedCourseId: (courseId: string | null) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      learningLevel: "standard",
      selectedCourseId: null,
      setLearningLevel: (learningLevel) => set({ learningLevel }),
      setSelectedCourseId: (selectedCourseId) => set({ selectedCourseId }),
    }),
    { name: "intellishala-preferences" }
  )
);
