"use client";

import { useState } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { LANGUAGE_NAMES } from "@/lib/constants";

const STEPS = [
  "Generating notes…",
  "Building mindmap…",
  "Creating timeline…",
  "Finding important points…",
  "Writing exam questions…",
  "Compressing revision notes…",
];

export default function GenerateAllButton() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);
  const targetLanguage = useLectureStore((s) => s.targetLanguage);
  const importantLines = useLectureStore((s) => s.importantLines);
  const recordingStartTime = useLectureStore((s) => s.recordingStartTime);
  const isRecording = useLectureStore((s) => s.isRecording);
  const setStructuredNotes = useLectureStore((s) => s.setStructuredNotes);
  const setMindmapMarkdown = useLectureStore((s) => s.setMindmapMarkdown);
  const setTimeline = useLectureStore((s) => s.setTimeline);
  const addImportantFromLLM = useLectureStore((s) => s.addImportantFromLLM);
  const setExamQuestions = useLectureStore((s) => s.setExamQuestions);
  const setRevisionNotes = useLectureStore((s) => s.setRevisionNotes);

  const generateAll = async () => {
    if (!fullTranscript || isRecording) return;
    setLoading(true);
    setError(null);

    const durationMinutes = recordingStartTime
      ? Math.ceil((Date.now() - recordingStartTime) / 60000)
      : 30;

    let stepIdx = 0;
    const interval = setInterval(() => {
      setStep(STEPS[stepIdx % STEPS.length]);
      stepIdx++;
    }, 2000);

    try {
      const res = await fetch("/api/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-all",
          transcript: fullTranscript,
          targetLanguage: LANGUAGE_NAMES[targetLanguage],
          importantLines: importantLines.map((l) => l.text),
          durationMinutes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      if (data.structuredNotes) setStructuredNotes(data.structuredNotes);
      if (data.mindmapMarkdown) setMindmapMarkdown(data.mindmapMarkdown);
      if (data.timeline) setTimeline(data.timeline);
      if (data.importantLines) addImportantFromLLM(data.importantLines);
      if (data.examQuestions) setExamQuestions(data.examQuestions);
      if (data.revisionNotes) setRevisionNotes(data.revisionNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStep("");
    }
  };

  if (!fullTranscript || isRecording) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={generateAll}
        disabled={loading}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? step || "Generating…" : "✨ Generate All AI Content"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
