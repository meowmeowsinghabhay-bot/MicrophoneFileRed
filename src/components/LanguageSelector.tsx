"use client";

import { LANGUAGES } from "@/lib/constants";
import { LanguageCode } from "@/lib/constants";
import { useLectureStore } from "@/store/lectureStore";

export default function LanguageSelector() {
  const targetLanguage = useLectureStore((s) => s.targetLanguage);
  const setTargetLanguage = useLectureStore((s) => s.setTargetLanguage);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language" className="text-sm font-medium text-app-muted">
        Translate to:
      </label>
      <select
        id="language"
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
        className="rounded-lg border border-app bg-app-card px-3 py-1.5 text-sm font-medium text-app shadow-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native} ({lang.label})
          </option>
        ))}
      </select>
    </div>
  );
}
