"use client";

import { useState } from "react";
import { useLectureStore } from "@/store/lectureStore";

export default function ExamTab() {
  const [loading, setLoading] = useState(false);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);
  const structuredNotes = useLectureStore((s) => s.structuredNotes);
  const importantLines = useLectureStore((s) => s.importantLines);
  const examQuestions = useLectureStore((s) => s.examQuestions);
  const setExamQuestions = useLectureStore((s) => s.setExamQuestions);

  const generateExam = async () => {
    if (!fullTranscript) return;
    setLoading(true);
    try {
      const res = await fetch("/api/exam-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: fullTranscript,
          notes: structuredNotes,
          importantLines: importantLines.map((l) => l.text),
        }),
      });
      const data = await res.json();
      if (data.questions) setExamQuestions(data.questions);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (!fullTranscript) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-app-muted">
        <div className="mb-4 text-5xl">📋</div>
        <p>Record a lecture first to generate exam questions</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {examQuestions.length === 0 && (
        <div className="mb-4">
          <button
            onClick={generateExam}
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Exam Questions"}
          </button>
        </div>
      )}

      {examQuestions.length > 0 ? (
        <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-app bg-app-card p-6">
          {examQuestions.map((q, i) => (
            <div key={i} className="rounded-lg border border-app p-4">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    q.type === "short"
                      ? "bg-green-100 text-green-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {q.type === "short" ? "Short Answer" : "Long Answer"}
                </span>
                <span className="text-xs text-app-muted">Q{i + 1}</span>
              </div>
              <p className="text-sm font-medium text-app">{q.question}</p>
              {q.hint && (
                <p className="mt-2 text-xs text-app-muted">Hint: {q.hint}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-app-muted">
          <p>Click &quot;Generate Exam Questions&quot; to create practice questions</p>
        </div>
      )}
    </div>
  );
}
