"use client";

import { useEffect } from "react";
import { useLectureStore } from "@/store/lectureStore";

interface HydrateProps {
  fullTranscript: string;
  segments: {
    id: string;
    text: string;
    translatedText?: string | null;
    startMs: number;
    isImportant: boolean;
  }[];
  notes: string;
  mindmap: string;
  revision: string;
  examQuestions: { type: string; question: string; hint?: string }[];
  importantLines: string[];
}

export default function LectureHydrator({
  fullTranscript,
  segments,
  notes,
  mindmap,
  revision,
  examQuestions,
  importantLines,
}: HydrateProps) {
  const loadLectureData = useLectureStore((s) => s.loadLectureData);
  const setStructuredNotes = useLectureStore((s) => s.setStructuredNotes);
  const setMindmapMarkdown = useLectureStore((s) => s.setMindmapMarkdown);
  const setRevisionNotes = useLectureStore((s) => s.setRevisionNotes);
  const setExamQuestions = useLectureStore((s) => s.setExamQuestions);
  const addImportantFromLLM = useLectureStore((s) => s.addImportantFromLLM);

  useEffect(() => {
    loadLectureData({
      fullTranscript,
      segments: segments.map((s) => ({
        id: s.id,
        text: s.text,
        translatedText: s.translatedText || undefined,
        timestamp: s.startMs,
        isFinal: true,
        isImportant: s.isImportant,
      })),
      structuredNotes: notes,
      mindmapMarkdown: mindmap,
      revisionNotes: revision,
      recordingStartTime: 0,
    });
    if (notes) setStructuredNotes(notes);
    if (mindmap) setMindmapMarkdown(mindmap);
    if (revision) setRevisionNotes(revision);
    if (examQuestions.length) setExamQuestions(examQuestions as never);
    if (importantLines.length) addImportantFromLLM(importantLines);
  }, [
    fullTranscript,
    segments,
    notes,
    mindmap,
    revision,
    examQuestions,
    importantLines,
    loadLectureData,
    setStructuredNotes,
    setMindmapMarkdown,
    setRevisionNotes,
    setExamQuestions,
    addImportantFromLLM,
  ]);

  return null;
}
