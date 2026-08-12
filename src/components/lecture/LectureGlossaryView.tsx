"use client";

import { useMemo, useState } from "react";
import { GlossaryTerm } from "@/lib/types";
import { LANGUAGE_NAMES, LanguageCode } from "@/lib/constants";
import { usePreferencesStore } from "@/store/preferencesStore";
import GlossaryPanel from "@/components/lecture/GlossaryPanel";

interface LectureGlossaryViewProps {
  transcript: string;
  notes?: string;
  targetLanguage?: string | null;
  savedContent?: string | null;
}

function parseSaved(content?: string | null): GlossaryTerm[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function LectureGlossaryView({
  transcript,
  notes,
  targetLanguage,
  savedContent,
}: LectureGlossaryViewProps) {
  const learningLevel = usePreferencesStore((s) => s.learningLevel);
  const initial = useMemo(() => parseSaved(savedContent), [savedContent]);
  const [terms, setTerms] = useState<GlossaryTerm[]>(initial);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(savedContent ? "saved" : null);

  const langCode =
    targetLanguage && targetLanguage.toLowerCase() in LANGUAGE_NAMES
      ? targetLanguage.toLowerCase()
      : "hi";
  const langLabel = LANGUAGE_NAMES[langCode as LanguageCode];

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/glossary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          notes,
          targetLanguage: langLabel,
          learningLevel,
        }),
      });
      const data = await res.json();
      if (data.terms) {
        setTerms(data.terms);
        setSource(data.source || null);
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlossaryPanel
      terms={terms}
      targetLanguage={langCode}
      source={source}
      loading={loading}
      onGenerate={generate}
      emptyMessage="Build a bilingual glossary of technical terms and formulas from this lecture."
    />
  );
}
