"use client";

import { useMemo, useState } from "react";
import { LANGUAGES, LANGUAGE_NAMES, LanguageCode } from "@/lib/constants";
import { demoHindiForSegment } from "@/lib/demo-translations";
import SpeakButton from "@/components/SpeakButton";

export interface TranscriptSegment {
  id: string;
  text: string;
  translatedText: string | null;
  startMs: number;
  endMs: number;
  isImportant: boolean;
  isManualFlag: boolean;
}

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  durationMs?: number | null;
  targetLanguage?: string | null;
  searchQuery?: string;
  onJumpToTime?: (ms: number) => void;
}

type ViewMode = "original" | "bilingual";

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function languageLabel(code: string | null | undefined): string {
  if (!code) return "Translation";
  const normalized = code.toLowerCase();
  if (normalized in LANGUAGE_NAMES) {
    const key = normalized as LanguageCode;
    const lang = LANGUAGES.find((l) => l.code === key);
    return lang?.native || LANGUAGE_NAMES[key];
  }
  return code.toUpperCase();
}

function parseTranslation(
  raw: string | null,
  fallbackLang?: string | null,
  sourceText?: string
) {
  const demoHi = sourceText ? demoHindiForSegment(sourceText) : undefined;
  if (demoHi) {
    return { label: languageLabel("hi"), text: demoHi };
  }

  if (!raw) {
    return { label: languageLabel(fallbackLang), text: "" };
  }

  const bracket = raw.match(/^\[([A-Za-z]{2})\]\s*([\s\S]*)$/);
  if (bracket) {
    const body = bracket[2].trim();
    if (sourceText && body === sourceText.trim()) {
      return { label: languageLabel(bracket[1]), text: "" };
    }
    return {
      label: languageLabel(bracket[1]),
      text: body,
    };
  }

  const text = raw.trim();
  if (sourceText && text === sourceText.trim()) {
    return { label: languageLabel(fallbackLang), text: "" };
  }

  return {
    label: languageLabel(fallbackLang),
    text,
  };
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${escapeRegex(query.trim())})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.trim().toLowerCase() ? (
      <mark key={i} className="rounded bg-brand-500/20 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function TranscriptPanel({
  segments,
  durationMs,
  targetLanguage,
  searchQuery = "",
  onJumpToTime,
}: TranscriptPanelProps) {
  const [view, setView] = useState<ViewMode>("bilingual");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const translated = segments.filter((s) => {
      if (demoHindiForSegment(s.text)) return true;
      const parsed = parseTranslation(s.translatedText, targetLanguage, s.text);
      return Boolean(parsed.text);
    }).length;
    const important = segments.filter((s) => s.isImportant).length;
    const totalMs =
      durationMs ??
      (segments.length > 0 ? segments[segments.length - 1].endMs : 0);

    return { translated, important, totalMs, count: segments.length };
  }, [segments, durationMs]);

  const copySegment = async (segment: TranscriptSegment) => {
    const parsed = parseTranslation(segment.translatedText, targetLanguage, segment.text);
    const body =
      view === "bilingual" && parsed.text
        ? `${segment.text}\n\n${parsed.label}: ${parsed.text}`
        : segment.text;

    try {
      await navigator.clipboard.writeText(body);
      setCopiedId(segment.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="transcript-panel">
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-app bg-app-secondary p-1">
          {(["original", "bilingual"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium capitalize transition ${
                view === mode
                  ? "bg-app-card text-brand-600 shadow-sm dark:text-brand-400"
                  : "text-app-muted hover:text-app"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <StatChip label="Segments" value={String(stats.count)} />
          <StatChip label="Duration" value={formatDuration(stats.totalMs)} />
          {stats.important > 0 && (
            <StatChip label="Important" value={String(stats.important)} accent />
          )}
          {view === "bilingual" && (
            <StatChip
              label="Translated"
              value={`${stats.translated}/${stats.count}`}
            />
          )}
        </div>
      </div>

      {/* Segment list */}
      <div className="transcript-scroll max-h-[520px] space-y-0 overflow-y-auto pr-1">
        {segments.map((segment, index) => {
          const parsed = parseTranslation(segment.translatedText, targetLanguage, segment.text);
          const isLast = index === segments.length - 1;

          return (
            <article
              key={segment.id}
              className={`transcript-segment group relative pl-8 ${
                segment.isImportant
                  ? "transcript-segment-important"
                  : ""
              }`}
            >
              {/* Timeline rail */}
              <div className="absolute left-[11px] top-0 flex h-full flex-col items-center">
                <span
                  className={`z-10 mt-5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-app-card ${
                    segment.isImportant
                      ? "bg-amber-500"
                      : "bg-brand-500/80"
                  }`}
                />
                {!isLast && (
                  <span className="min-h-[calc(100%-1.25rem)] w-px flex-1 bg-app" />
                )}
              </div>

              <div className="mb-3 rounded-2xl border border-app bg-app-secondary/60 p-4 transition hover:border-brand-500/30 hover:bg-app-secondary">
                {/* Header row */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onJumpToTime?.(segment.startMs)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-app-card px-2.5 py-1 font-mono text-xs font-semibold text-brand-600 transition hover:bg-accent-soft dark:text-brand-400"
                      title="Jump to this moment in Catch Up"
                    >
                      <span className="text-[10px] opacity-70">▶</span>
                      {formatMs(segment.startMs)}
                    </button>

                    {segment.isImportant && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                        ⭐ {segment.isManualFlag ? "Teacher flagged" : "Key moment"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <SpeakButton text={segment.text} langCode="en" label="Read English aloud" />
                    {view === "bilingual" && parsed.text && (
                      <SpeakButton
                        text={parsed.text}
                        langCode={targetLanguage}
                        label="Read translation aloud"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => copySegment(segment)}
                      className="rounded-lg border border-transparent px-2 py-1 text-[10px] font-medium text-app-muted opacity-0 transition group-hover:opacity-100 hover:border-app hover:bg-app-card hover:text-app"
                    >
                      {copiedId === segment.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Original */}
                <div className="space-y-1">
                  <span className="inline-block rounded-md bg-app-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-app-muted">
                    English
                  </span>
                  <p className="text-sm leading-relaxed text-app">
                    {highlightText(segment.text, searchQuery)}
                  </p>
                </div>

                {/* Translation */}
                {view === "bilingual" && (
                  <div className="mt-3 space-y-1 border-t border-app/60 pt-3">
                    {parsed.text ? (
                      <>
                        <span className="inline-block rounded-md bg-brand-600/10 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                          {parsed.label}
                        </span>
                        <p className="text-sm leading-relaxed text-brand-700 dark:text-brand-300">
                          {highlightText(parsed.text, searchQuery)}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs italic text-app-muted">
                        Translation not available for this segment
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${
        accent
          ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "border-app bg-app-secondary text-app-muted"
      }`}
    >
      <span className="font-medium">{value}</span>
      <span className="opacity-70">{label}</span>
    </span>
  );
}
