"use client";

import { useEffect, useRef } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useLiveTranslation } from "@/hooks/useLiveTranslation";
import { LANGUAGE_NAMES } from "@/lib/constants";
import SpeakButton from "@/components/SpeakButton";

/** Visual shell only — speech + translation hooks are untouched black boxes. */
export default function LiveCaptions() {
  const segments = useLectureStore((s) => s.segments);
  const targetLanguage = useLectureStore((s) => s.targetLanguage);
  const isRecording = useLectureStore((s) => s.isRecording);
  const translationError = useLectureStore((s) => s.translationError);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isSupported, error, isListening } = useSpeechRecognition();
  useLiveTranslation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments]);

  const displaySegments = segments.filter(
    (s) => s.isFinal || s === segments[segments.length - 1]
  );

  return (
    <div className="flex h-full flex-col">
      {!isSupported && (
        <div className="mb-4 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          Speech recognition requires Chrome or Edge.
        </div>
      )}

      {translationError && (
        <div className="mb-4 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <strong>Translation unavailable:</strong> {translationError}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-300/50 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {isRecording && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-xs text-brand-700 dark:text-brand-300">
          <span
            className={`h-2 w-2 rounded-full ${isListening ? "animate-pulse bg-green-500" : "bg-amber-400"}`}
          />
          {isListening
            ? `Live · translating to ${LANGUAGE_NAMES[targetLanguage]}`
            : "Reconnecting microphone…"}
        </div>
      )}

      {!isRecording && segments.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-app bg-app-secondary/50 p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-3xl">
            🎙️
          </div>
          <p className="text-lg font-semibold text-app">Ready to capture</p>
          <p className="mt-1 max-w-sm text-sm text-app-muted">
            Start the lecture to begin live transcription and translation
          </p>
        </div>
      )}

      <div
        ref={scrollRef}
        className="caption-scroll flex-1 space-y-4 overflow-y-auto rounded-2xl border border-app bg-app-card p-6 shadow-app"
      >
        {displaySegments.map((segment) => (
          <div key={segment.id} className="group border-b border-app pb-3 last:border-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
              <SpeakButton text={segment.text} langCode="en" label="Read English aloud" />
              {targetLanguage !== "en" && segment.translatedText && (
                <SpeakButton
                  text={segment.translatedText.replace(/^\[[A-Za-z]{2}\]\s*/, "")}
                  langCode={targetLanguage}
                  label="Read translation aloud"
                />
              )}
            </div>
            <p
              className={`text-base leading-relaxed text-app ${!segment.isFinal ? "italic opacity-60" : ""}`}
            >
              {segment.isImportant && (
                <span className="mr-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs dark:bg-amber-900/40">
                  ⭐ Important
                </span>
              )}
              {segment.text}
            </p>
            {targetLanguage !== "en" && (
              <p
                className={`mt-1 text-base leading-relaxed text-brand-600 dark:text-brand-400 ${!segment.isFinal ? "italic opacity-60" : ""}`}
              >
                {segment.translatedText || (
                  <span className="text-app-muted">
                    {segment.isFinal ? "Translating…" : "…"}
                  </span>
                )}
              </p>
            )}
          </div>
        ))}

        {isRecording && segments.length === 0 && (
          <div className="flex items-center gap-2 text-app-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
            Listening for speech…
          </div>
        )}
      </div>
    </div>
  );
}
