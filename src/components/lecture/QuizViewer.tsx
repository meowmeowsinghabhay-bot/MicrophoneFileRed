"use client";

interface Question {
  type: string;
  question: string;
  hint?: string;
}

export default function QuizViewer({ questions }: { questions: Question[] }) {
  if (!questions.length) {
    return <p className="text-app-muted">No quiz questions for this lecture.</p>;
  }

  return (
    <div className="space-y-4">
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
        </div>
      ))}
    </div>
  );
}
