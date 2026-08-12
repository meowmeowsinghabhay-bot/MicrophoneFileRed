"use client";

import { useEffect, useState } from "react";

const LANGUAGES = ["English", "हिन्दी", "বাংলা", "العربية", "தமிழ்"];

const CAPTIONS = [
  {
    en: "Today we study binary search trees…",
    tr: "आज हम बाइनरी सर्च ट्री पढ़ेंगे…",
    lang: "Hindi",
  },
  {
    en: "The time complexity is O(log n)…",
    tr: "সময়ের জটিলতা O(log n)…",
    lang: "Bangla",
  },
  {
    en: "Remember this for the exam…",
    tr: "تذكر هذا للامتحان…",
    lang: "Arabic",
  },
  {
    en: "Let me explain the base case…",
    tr: "அடிப்படை வழக்கை விளக்குகிறேன்…",
    lang: "Tamil",
  },
];

const NOTES = ["Structured notes", "Mindmap", "Revision", "Quiz"];

export default function HeroVisual() {
  const [captionIdx, setCaptionIdx] = useState(0);
  const [langIdx, setLangIdx] = useState(0);
  const [noteIdx, setNoteIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCaptionIdx((i) => (i + 1) % CAPTIONS.length);
        setFade(true);
      }, 280);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLangIdx((i) => (i + 1) % LANGUAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNoteIdx((i) => (i + 1) % NOTES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const caption = CAPTIONS[captionIdx];

  return (
    <div className="relative w-full max-w-md">
      {/* Ambient glow */}
      <div className="hero-glow absolute -inset-4 rounded-[2rem] bg-brand-500/10 blur-2xl dark:bg-brand-500/5" />

      <div className="relative overflow-hidden rounded-3xl border border-app bg-app-card p-6 shadow-app">
        {/* Live badge + language cycle */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1.5 dark:bg-brand-500/15">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Live lecture</span>
          </div>
          <div className="hero-lang-pill rounded-full border border-app bg-app-secondary px-3 py-1 text-xs font-medium text-app">
            <span key={langIdx} className="hero-fade-in block">
              {LANGUAGES[langIdx]}
            </span>
          </div>
        </div>

        {/* Sound wave */}
        <div className="mb-5 flex h-10 items-end justify-center gap-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="hero-wave-bar w-1 rounded-full bg-brand-500/70 dark:bg-brand-400/80"
              style={{
                animationDelay: `${i * 0.07}s`,
                height: `${30 + ((i * 7) % 28)}%`,
              }}
            />
          ))}
        </div>

        {/* Caption card */}
        <div
          className={`rounded-2xl border border-app bg-app-secondary/80 p-4 transition-opacity duration-300 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-app-muted">Teacher</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-app">{caption.en}</p>
          <div className="my-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-app" />
            <span className="text-[10px] font-medium text-brand-600">AI translate → {caption.lang}</span>
            <div className="h-px flex-1 bg-app" />
          </div>
          <p className="text-sm font-medium leading-relaxed text-brand-600 dark:text-brand-400">{caption.tr}</p>
        </div>

        {/* Floating feature chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {["Captions", "Notes", "Mindmap"].map((label, i) => (
            <span
              key={label}
              className="hero-chip rounded-lg border border-app bg-app px-2.5 py-1 text-[11px] font-medium text-app-muted"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              {label}
            </span>
          ))}
          <span
            key={noteIdx}
            className="hero-fade-in rounded-lg bg-brand-600/10 px-2.5 py-1 text-[11px] font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
          >
            + {NOTES[noteIdx]}
          </span>
        </div>
      </div>

      {/* Floating language badges */}
      <div className="pointer-events-none absolute -right-3 top-6 flex flex-col gap-2">
        {["EN", "HI", "BN", "AR"].map((code, i) => (
          <span
            key={code}
            className="hero-chip flex h-7 w-7 items-center justify-center rounded-full border border-app bg-app-card text-[9px] font-bold text-brand-600 shadow-app"
            style={{ animationDelay: `${i * 0.35}s` }}
          >
            {code}
          </span>
        ))}
      </div>
    </div>
  );
}
