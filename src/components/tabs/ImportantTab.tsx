"use client";

import { useState } from "react";
import { useLectureStore } from "@/store/lectureStore";

export default function ImportantTab() {
  const [loading, setLoading] = useState(false);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);
  const importantLines = useLectureStore((s) => s.importantLines);
  const addImportantFromLLM = useLectureStore((s) => s.addImportantFromLLM);

  const runLLMPass = async () => {
    if (!fullTranscript) return;
    setLoading(true);
    try {
      const res = await fetch("/api/important-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: fullTranscript }),
      });
      const data = await res.json();
      if (data.lines) addImportantFromLLM(data.lines);
    } finally {
      setLoading(false);
    }
  };

  if (!fullTranscript) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-app-muted">
        <div className="mb-4 text-5xl">⭐</div>
        <p>Live keyword detection runs automatically during recording</p>
        <p className="mt-1 text-xs">Zero API cost · regex/keyword match in code</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={runLLMPass}
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "AI Deep Scan (optional)"}
        </button>
        <span className="text-xs text-app-muted">
          Live pass = code · Deep scan = LLM (secondary)
        </span>
      </div>

      {importantLines.length > 0 ? (
        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-app bg-app-card p-6">
          {importantLines.map((line) => (
            <div key={line.id} className="flex gap-3 rounded-xl border border-amber-200/50 bg-amber-50 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
              <span>⭐</span>
              <div>
                <span className="mb-1 inline-block rounded bg-accent-soft px-2 py-0.5 text-xs text-brand-700">
                  {line.isImportant ? "Code-detected" : "AI-assisted"}
                </span>
                <p className="text-sm text-app">{line.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-app-muted">
          <p>Say &quot;important&quot; or &quot;remember this&quot; during the lecture — flagged instantly by code</p>
        </div>
      )}
    </div>
  );
}
