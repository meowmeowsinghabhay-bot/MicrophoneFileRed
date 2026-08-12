"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { LANGUAGE_NAMES } from "@/lib/constants";

const BATCH_DELAY_MS = 400;
const MAX_BATCH_SIZE = 5;

export function useLiveTranslation() {
  const targetLanguage = useLectureStore((s) => s.targetLanguage);
  const segments = useLectureStore((s) => s.segments);
  const updateSegmentTranslations = useLectureStore(
    (s) => s.updateSegmentTranslations
  );
  const setTranslationError = useLectureStore((s) => s.setTranslationError);
  const pendingRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetLanguageRef = useRef(targetLanguage);

  useEffect(() => {
    targetLanguageRef.current = targetLanguage;
    setTranslationError(null);
  }, [targetLanguage, setTranslationError]);

  const flushQueue = useCallback(async () => {
    const lang = targetLanguageRef.current;
    const state = useLectureStore.getState();
    const pending = state.segments.filter(
      (s) =>
        s.isFinal &&
        s.text.trim() &&
        !s.translatedText &&
        !pendingRef.current.has(s.id)
    );

    if (pending.length === 0) return;

    const batch = pending.slice(0, MAX_BATCH_SIZE);
    batch.forEach((s) => pendingRef.current.add(s.id));

    if (lang === "en") {
      updateSegmentTranslations(
        batch.map((s) => ({ id: s.id, translatedText: s.text }))
      );
      batch.forEach((s) => pendingRef.current.delete(s.id));
      return;
    }

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: batch.map((s) => s.text),
          targetLanguage: LANGUAGE_NAMES[lang],
          learningLevel: usePreferencesStore.getState().learningLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Translation request failed");
      }

      const translations: string[] = data.translations ?? [data.translated];
      setTranslationError(null);

      updateSegmentTranslations(
        batch.map((s, i) => ({
          id: s.id,
          translatedText: translations[i]?.trim() || s.text,
        }))
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Translation failed";
      setTranslationError(message);
    } finally {
      batch.forEach((s) => pendingRef.current.delete(s.id));
    }

    const stillPending = useLectureStore
      .getState()
      .segments.some(
        (s) => s.isFinal && !s.translatedText && !pendingRef.current.has(s.id)
      );
    if (stillPending) {
      timerRef.current = setTimeout(flushQueue, BATCH_DELAY_MS);
    }
  }, [updateSegmentTranslations, setTranslationError]);

  const scheduleTranslation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushQueue, BATCH_DELAY_MS);
  }, [flushQueue]);

  useEffect(() => {
    const needsTranslation = segments.some(
      (s) => s.isFinal && s.text.trim() && !s.translatedText
    );
    if (needsTranslation && targetLanguage !== "en") {
      scheduleTranslation();
    } else if (targetLanguage === "en") {
      const englishUpdates = segments
        .filter((s) => s.isFinal && s.translatedText !== s.text)
        .map((s) => ({ id: s.id, translatedText: s.text }));
      if (englishUpdates.length > 0) {
        updateSegmentTranslations(englishUpdates);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [segments, targetLanguage, scheduleTranslation, updateSegmentTranslations]);

  return { scheduleTranslation };
}
