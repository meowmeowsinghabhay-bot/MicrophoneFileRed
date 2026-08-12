"use client";

import { useState } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { LANGUAGE_NAMES } from "@/lib/constants";
import ReactMarkdown from "react-markdown";

export default function RevisionTab() {
  const [loading, setLoading] = useState(false);
  const structuredNotes = useLectureStore((s) => s.structuredNotes);
  const revisionNotes = useLectureStore((s) => s.revisionNotes);
  const targetLanguage = useLectureStore((s) => s.targetLanguage);
  const setRevisionNotes = useLectureStore((s) => s.setRevisionNotes);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);

  const generateRevision = async () => {
    if (!structuredNotes) return;
    setLoading(true);
    try {
      const res = await fetch("/api/revision-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: structuredNotes,
          targetLanguage: LANGUAGE_NAMES[targetLanguage],
        }),
      });
      const data = await res.json();
      if (data.revision) setRevisionNotes(data.revision);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (!fullTranscript) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-app-muted">
        <div className="mb-4 text-5xl">📄</div>
        <p>Record a lecture and generate notes first</p>
      </div>
    );
  }

  if (!structuredNotes) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-app-muted">
        <p>Generate class notes first, then create revision summary</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {!revisionNotes && (
        <div className="mb-4">
          <button
            onClick={generateRevision}
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Compressing..." : "Generate Revision Notes"}
          </button>
        </div>
      )}

      {revisionNotes ? (
        <div className="prose prose-edu max-w-none flex-1 overflow-y-auto rounded-xl border border-app bg-app-card p-6">
          <ReactMarkdown>{revisionNotes}</ReactMarkdown>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-app-muted">
          <p>Click to create a one-page revision summary</p>
        </div>
      )}
    </div>
  );
}
