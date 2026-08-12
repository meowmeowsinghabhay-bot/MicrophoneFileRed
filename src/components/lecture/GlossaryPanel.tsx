"use client";

import { useState } from "react";
import { GlossaryTerm } from "@/lib/types";
import { LANGUAGE_NAMES, LanguageCode } from "@/lib/constants";
import SpeakButton from "@/components/SpeakButton";

interface GlossaryPanelProps {
  terms: GlossaryTerm[];
  targetLanguage?: string | null;
  source?: string | null;
  loading?: boolean;
  onGenerate?: () => void;
  emptyMessage?: string;
}

const CATEGORY_STYLE: Record<GlossaryTerm["category"], string> = {
  term: "bg-app-secondary text-app-muted",
  concept: "bg-brand-600/10 text-brand-600 dark:text-brand-400",
  formula: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
};

export default function GlossaryPanel({
  terms,
  targetLanguage,
  source,
  loading,
  onGenerate,
  emptyMessage = "Generate a bilingual glossary of key terms from this lecture.",
}: GlossaryPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const langCode =
    targetLanguage && targetLanguage.toLowerCase() in LANGUAGE_NAMES
      ? (targetLanguage.toLowerCase() as LanguageCode)
      : "hi";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-app-muted">
        <div className="mb-3 text-4xl">📖</div>
        <p className="text-sm">Building glossary…</p>
      </div>
    );
  }

  if (terms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-app bg-app-secondary/40 py-16 text-center">
        <div className="mb-3 text-5xl">📖</div>
        <p className="max-w-sm text-sm text-app-muted">{emptyMessage}</p>
        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            className="btn-primary mt-4 px-4 py-2 text-sm"
          >
            Generate Glossary
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-app">
            {terms.length} key terms · formulas preserved
          </p>
          {source && (
            <p className="text-xs text-app-muted">
              Source: {source === "openai" ? "AI-generated" : "Built-in term detection"}
            </p>
          )}
        </div>
        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            className="rounded-lg border border-app px-3 py-1.5 text-xs text-app-muted hover:text-brand-600"
          >
            Regenerate
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {terms.map((item) => {
          const isOpen = expanded === item.term;
          return (
            <article
              key={item.term}
              className="rounded-2xl border border-app bg-app-secondary/60 p-4 transition hover:border-brand-500/30"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span
                    className={`mb-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${CATEGORY_STYLE[item.category]}`}
                  >
                    {item.category}
                  </span>
                  <h3 className="text-base font-semibold text-app">{item.term}</h3>
                </div>
                <SpeakButton text={item.definition} langCode="en" label="Read definition" />
              </div>

              <p className="text-sm leading-relaxed text-app">{item.definition}</p>

              {item.translation && (
                <div className="mt-3 border-t border-app/60 pt-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                      {LANGUAGE_NAMES[langCode]}
                    </span>
                    <SpeakButton
                      text={item.translation}
                      langCode={langCode}
                      label="Read translation"
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-brand-700 dark:text-brand-300">
                    {item.translation}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : item.term)}
                className="mt-2 text-[10px] font-medium text-app-muted hover:text-brand-600"
              >
                {isOpen ? "Show less" : "Show more"}
              </button>

              {isOpen && (
                <p className="mt-2 rounded-lg bg-app-card p-2 text-xs text-app-muted">
                  Tip: Add this term to your revision notes or bookmark the transcript moment
                  where it was introduced.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
