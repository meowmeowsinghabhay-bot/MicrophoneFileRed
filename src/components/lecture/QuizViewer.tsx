"use client";

import { useState } from "react";

interface Question {
  type: string;
  question: string;
  hint?: string;
}

export default function QuizViewer({
  questions,
  lectureId,
  studentId,
}: {
  questions: Question[];
  lectureId?: string;
  studentId?: string;
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!questions.length) {
    return <p className="text-app-muted">No quiz questions for this lecture.</p>;
  }

  const score = Object.values(checked).filter(Boolean).length;
  const canSave = Boolean(lectureId && studentId && studentId !== "demo");

  const toggle = (index: number, value: boolean) => {
    if (submitted) return;
    setChecked((prev) => ({ ...prev, [index]: value }));
  };

  const submit = async () => {
    if (!canSave) {
      setSubmitted(true);
      setMessage("Self-check recorded locally");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/lectures/${lectureId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          score,
          total: questions.length,
          answers: checked,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSubmitted(true);
      setMessage(`Score saved: ${score}/${questions.length}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save score");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-app-muted">
        Mark each question you feel confident about, then submit your self-check score.
      </p>

      {questions.map((q, i) => (
        <div key={i} className="rounded-xl border border-app bg-app-secondary p-4">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                q.type === "short"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              }`}
            >
              {q.type === "short" ? "Short Answer" : "Long Answer"}
            </span>
            <span className="text-xs text-app-muted">Q{i + 1}</span>
          </div>
          <p className="font-medium text-app">{q.question}</p>
          {q.hint && <p className="mt-2 text-xs text-app-muted">Hint: {q.hint}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => toggle(i, true)}
              className={`rounded-lg px-3 py-1 text-xs ${
                checked[i] === true
                  ? "bg-green-600 text-white"
                  : "border border-app bg-app-card text-app-muted"
              }`}
            >
              Got it
            </button>
            <button
              type="button"
              onClick={() => toggle(i, false)}
              className={`rounded-lg px-3 py-1 text-xs ${
                checked[i] === false
                  ? "bg-amber-600 text-white"
                  : "border border-app bg-app-card text-app-muted"
              }`}
            >
              Need review
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 border-t border-app pt-4">
        <p className="text-sm font-medium text-app">
          Score: {score}/{questions.length}
        </p>
        <button
          type="button"
          onClick={submit}
          disabled={saving || submitted}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : submitted ? "Submitted" : "Submit score"}
        </button>
        {message && <p className="text-xs text-app-muted">{message}</p>}
      </div>
    </div>
  );
}
