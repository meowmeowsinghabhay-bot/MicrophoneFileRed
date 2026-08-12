"use client";

import { useState } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { ExplainBackResult } from "@/lib/types";

export default function ExplainBackTab() {
  const [concept, setConcept] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainBackResult | null>(null);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);
  const structuredNotes = useLectureStore((s) => s.structuredNotes);
  const learningLevel = usePreferencesStore((s) => s.learningLevel);

  const evaluate = async () => {
    if (!concept.trim() || !explanation.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/explain-back", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept,
          studentExplanation: explanation,
          transcript: fullTranscript,
          notes: structuredNotes,
          learningLevel,
        }),
      });
      const data = await res.json();
      if (data.evaluation) setResult(data.evaluation);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (!fullTranscript) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-app-muted">
        <div className="mb-4 text-5xl">💬</div>
        <p>Record a lecture first to use explain-back mode</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-app">
            Concept to explain
          </label>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="e.g., Binary Search Trees"
            className="w-full rounded-lg border border-app px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-app">
            Your explanation
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain the concept in your own words..."
            rows={5}
            className="w-full rounded-lg border border-app px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          onClick={evaluate}
          disabled={loading || !concept.trim() || !explanation.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Evaluating..." : "Check My Explanation"}
        </button>
      </div>

      {result && (
        <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-app bg-app-card p-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold ${
                result.score >= 70
                  ? "bg-green-100 text-green-700"
                  : result.score >= 40
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {result.score}%
            </div>
            <div>
              <p className="font-medium text-app">Your Score</p>
              <p className="text-sm text-app-muted">{result.feedback}</p>
            </div>
          </div>

          {result.correct.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-green-700">What you got right</h4>
              <ul className="space-y-1">
                {result.correct.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-app">
                    <span className="text-green-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.missed.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-amber-700">What you missed</h4>
              <ul className="space-y-1">
                {result.missed.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-app">
                    <span className="text-amber-500">→</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
