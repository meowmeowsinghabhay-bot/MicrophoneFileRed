"use client";

import { useState } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { LANGUAGE_NAMES } from "@/lib/constants";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function NotesTab() {
  const [loading, setLoading] = useState(false);
  const [simplifying, setSimplifying] = useState(false);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);
  const boardCaptures = useLectureStore((s) => s.boardCaptures);
  const structuredNotes = useLectureStore((s) => s.structuredNotes);
  const simplifiedNotes = useLectureStore((s) => s.simplifiedNotes);
  const showSimplified = useLectureStore((s) => s.showSimplified);
  const targetLanguage = useLectureStore((s) => s.targetLanguage);
  const learningLevel = usePreferencesStore((s) => s.learningLevel);
  const setStructuredNotes = useLectureStore((s) => s.setStructuredNotes);
  const setSimplifiedNotes = useLectureStore((s) => s.setSimplifiedNotes);
  const toggleSimplified = useLectureStore((s) => s.toggleSimplified);

  const generateNotes = async () => {
    if (!fullTranscript) return;
    setLoading(true);
    try {
      const boardDescriptions = boardCaptures.map(
        (c) => `[${new Date(c.timestamp).toLocaleTimeString()}] ${c.description}`
      );
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: fullTranscript,
          boardDescriptions,
          targetLanguage: LANGUAGE_NAMES[targetLanguage],
        }),
      });
      const data = await res.json();
      if (data.notes) setStructuredNotes(data.notes);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const simplifyNotes = async () => {
    if (!structuredNotes) return;
    setSimplifying(true);
    try {
      const res = await fetch("/api/simplify-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: structuredNotes,
          targetLanguage: LANGUAGE_NAMES[targetLanguage],
          learningLevel,
        }),
      });
      const data = await res.json();
      if (data.simplified) setSimplifiedNotes(data.simplified);
    } catch {
      // Silently fail
    } finally {
      setSimplifying(false);
    }
  };

  const displayNotes = showSimplified && simplifiedNotes ? simplifiedNotes : structuredNotes;

  if (!fullTranscript) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-app-muted">
        <div className="mb-4 text-5xl">📝</div>
        <p>Record a lecture first to generate notes</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {!structuredNotes && (
          <button
            onClick={generateNotes}
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Notes"}
          </button>
        )}
        {structuredNotes && !simplifiedNotes && (
          <button
            onClick={simplifyNotes}
            disabled={simplifying}
            className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
          >
            {simplifying ? "Simplifying..." : "Simplify (ELI5)"}
          </button>
        )}
        {simplifiedNotes && (
          <button
            onClick={toggleSimplified}
            className="rounded-lg border border-app px-4 py-2 text-sm text-app transition hover:bg-app-secondary"
          >
            {showSimplified ? "Show Full Notes" : "Show Simplified"}
          </button>
        )}
      </div>

      {displayNotes ? (
        <div className="prose prose-edu max-w-none flex-1 overflow-y-auto rounded-xl border border-app bg-app-card p-6">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {displayNotes}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-app-muted">
          <p>Click &quot;Generate Notes&quot; to create structured class notes from the transcript</p>
        </div>
      )}
    </div>
  );
}
