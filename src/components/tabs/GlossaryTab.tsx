"use client";

import { useState } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { LANGUAGE_NAMES } from "@/lib/constants";
import GlossaryPanel from "@/components/lecture/GlossaryPanel";

export default function GlossaryTab() {
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);
  const structuredNotes = useLectureStore((s) => s.structuredNotes);
  const targetLanguage = useLectureStore((s) => s.targetLanguage);
  const glossaryTerms = useLectureStore((s) => s.glossaryTerms);
  const setGlossaryTerms = useLectureStore((s) => s.setGlossaryTerms);
  const learningLevel = usePreferencesStore((s) => s.learningLevel);

  const generate = async () => {
    if (!fullTranscript && !structuredNotes) return;
    setLoading(true);
    try {
      const res = await fetch("/api/glossary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: fullTranscript,
          notes: structuredNotes,
          targetLanguage: LANGUAGE_NAMES[targetLanguage],
          learningLevel,
        }),
      });
      const data = await res.json();
      if (data.terms) {
        setGlossaryTerms(data.terms);
        setSource(data.source || null);
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoading(false);
    }
  };

  if (!fullTranscript) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-app-muted">
        <div className="mb-4 text-5xl">📖</div>
        <p>Record a lecture first to build a glossary</p>
      </div>
    );
  }

  return (
    <GlossaryPanel
      terms={glossaryTerms}
      targetLanguage={targetLanguage}
      source={source}
      loading={loading}
      onGenerate={generate}
      emptyMessage="Extract key terms, formulas, and concepts with bilingual definitions."
    />
  );
}
