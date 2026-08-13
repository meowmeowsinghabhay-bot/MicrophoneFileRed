"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { LANGUAGE_NAMES } from "@/lib/constants";

/** Brief window to coalesce back-to-back final segments into one API call. */
const COALESCE_MS = 120;
/** Force a flush during continuous speech so translation never stalls indefinitely. */
const FORCE_FLUSH_MS = 450;
/** Delay before processing the next batch in a backlog. */
const FOLLOWUP_MS = 40;
const MAX_BATCH_SIZE = 8;

export function useLiveTranslation() {
  const speechLanguage = useLectureStore((s) => s.speechLanguage);
  const targetLanguage = useLectureStore((s) => s.targetLanguage);
  const segments = useLectureStore((s) => s.segments);
  const updateSegmentTranslations = useLectureStore(
    (s) => s.updateSegmentTranslations
  );
  const setTranslationError = useLectureStore((s) => s.setTranslationError);
  const pendingRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const oldestPendingAtRef = useRef<number | null>(null);
  const targetLanguageRef = useRef(targetLanguage);
  const speechLanguageRef = useRef(speechLanguage);
  const flushQueueRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    targetLanguageRef.current = targetLanguage;
    speechLanguageRef.current = speechLanguage;
    setTranslationError(null);
  }, [targetLanguage, speechLanguage, setTranslationError]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const flushQueue = useCallback(async () => {
    clearTimer();

    const target = targetLanguageRef.current;
    const source = speechLanguageRef.current;
    const state = useLectureStore.getState();
    const pending = state.segments.filter(
      (s) =>
        s.isFinal &&
        s.text.trim() &&
        !s.translatedText &&
        !pendingRef.current.has(s.id)
    );

    if (pending.length === 0) {
      oldestPendingAtRef.current = null;
      return;
    }

    const batch = pending.slice(0, MAX_BATCH_SIZE);
    batch.forEach((s) => pendingRef.current.add(s.id));

    if (source === target) {
      updateSegmentTranslations(
        batch.map((s) => ({ id: s.id, translatedText: s.text }))
      );
      batch.forEach((s) => pendingRef.current.delete(s.id));
      oldestPendingAtRef.current = null;
      return;
    }

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: batch.map((s) => s.text),
          sourceLanguage: LANGUAGE_NAMES[source],
          targetLanguage: LANGUAGE_NAMES[target],
          learningLevel: usePreferencesStore.getState().learningLevel,
          preferFast: true,
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
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void flushQueueRef.current();
      }, FOLLOWUP_MS);
    } else {
      oldestPendingAtRef.current = null;
    }
  }, [clearTimer, updateSegmentTranslations, setTranslationError]);

  flushQueueRef.current = flushQueue;

  const scheduleTranslation = useCallback(() => {
    const state = useLectureStore.getState();
    const hasPending = state.segments.some(
      (s) =>
        s.isFinal &&
        s.text.trim() &&
        !s.translatedText &&
        !pendingRef.current.has(s.id)
    );

    if (!hasPending) {
      oldestPendingAtRef.current = null;
      clearTimer();
      return;
    }

    if (!oldestPendingAtRef.current) {
      oldestPendingAtRef.current = Date.now();
    }

    const waited = Date.now() - oldestPendingAtRef.current;
    if (waited >= FORCE_FLUSH_MS) {
      void flushQueue();
      return;
    }

    if (!timerRef.current) {
      const delay = Math.max(COALESCE_MS, FORCE_FLUSH_MS - waited);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void flushQueue();
      }, delay);
    }
  }, [clearTimer, flushQueue]);

  useEffect(() => {
    const needsTranslation = segments.some(
      (s) => s.isFinal && s.text.trim() && !s.translatedText
    );

    if (needsTranslation && speechLanguage !== targetLanguage) {
      scheduleTranslation();
    } else if (speechLanguage === targetLanguage) {
      clearTimer();
      oldestPendingAtRef.current = null;
      const passthrough = segments
        .filter((s) => s.isFinal && s.translatedText !== s.text)
        .map((s) => ({ id: s.id, translatedText: s.text }));
      if (passthrough.length > 0) {
        updateSegmentTranslations(passthrough);
      }
    }

    return () => clearTimer();
  }, [
    segments,
    targetLanguage,
    speechLanguage,
    scheduleTranslation,
    updateSegmentTranslations,
    clearTimer,
  ]);

  return { scheduleTranslation };
}
