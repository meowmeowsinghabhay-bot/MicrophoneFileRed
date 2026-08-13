"use client";

import { LANGUAGES } from "@/lib/constants";
import { LanguageCode } from "@/lib/constants";
import { useLectureStore } from "@/store/lectureStore";

export default function LanguageSelector() {
  const speechLanguage = useLectureStore((s) => s.speechLanguage);
  const targetLanguage = useLectureStore((s) => s.targetLanguage);
  const isRecording = useLectureStore((s) => s.isRecording);
  const setSpeechLanguage = useLectureStore((s) => s.setSpeechLanguage);
  const setTargetLanguage = useLectureStore((s) => s.setTargetLanguage);

  const selectClass =
    "rounded-lg border border-app bg-app-card px-3 py-1.5 text-sm font-medium text-app shadow-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="speech-language" className="text-sm font-medium text-app-muted">
          Speak in:
        </label>
        <select
          id="speech-language"
          value={speechLanguage}
          disabled={isRecording}
          title={isRecording ? "Stop recording to change speech language" : undefined}
          onChange={(e) => setSpeechLanguage(e.target.value as LanguageCode)}
          className={selectClass}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native} ({lang.label})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="language" className="text-sm font-medium text-app-muted">
          Translate to:
        </label>
        <select
          id="language"
          value={targetLanguage}
          disabled={isRecording}
          title={isRecording ? "Stop recording to change translation language" : undefined}
          onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
          className={selectClass}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native} ({lang.label})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
