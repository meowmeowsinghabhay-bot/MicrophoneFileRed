"use client";

import { LEARNING_LEVELS, LearningLevel } from "@/lib/constants";
import { usePreferencesStore } from "@/store/preferencesStore";

export default function LearningLevelSelector({ compact }: { compact?: boolean }) {
  const learningLevel = usePreferencesStore((s) => s.learningLevel);
  const setLearningLevel = usePreferencesStore((s) => s.setLearningLevel);
  const active = LEARNING_LEVELS.find((l) => l.id === learningLevel);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <label htmlFor="learning-level" className="text-xs font-medium text-app-muted">
          Level:
        </label>
        <select
          id="learning-level"
          value={learningLevel}
          onChange={(e) => setLearningLevel(e.target.value as LearningLevel)}
          className="max-w-[140px] rounded-lg border border-app bg-app-card px-2 py-1.5 text-xs font-medium text-app outline-none focus:border-brand-500"
          title={active?.description}
        >
          {LEARNING_LEVELS.map((level) => (
            <option key={level.id} value={level.id}>
              {level.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-app bg-app-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">
        Learning level
      </p>
      <p className="mt-1 text-xs text-app-muted">
        Personalizes translations, notes, and AI answers
      </p>
      <div className="mt-3 inline-flex rounded-xl border border-app bg-app-secondary p-1">
        {LEARNING_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() => setLearningLevel(level.id)}
            title={level.description}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              learningLevel === level.id
                ? "bg-app-card text-brand-600 shadow-sm dark:text-brand-400"
                : "text-app-muted hover:text-app"
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>
      {active && (
        <p className="mt-2 text-xs text-brand-600 dark:text-brand-400">{active.description}</p>
      )}
    </div>
  );
}
