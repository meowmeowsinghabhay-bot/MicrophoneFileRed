"use client";

import { useLectureStore } from "@/store/lectureStore";

export default function ControlPanel() {
  const isRecording = useLectureStore((s) => s.isRecording);
  const startRecording = useLectureStore((s) => s.startRecording);
  const stopRecording = useLectureStore((s) => s.stopRecording);
  const reset = useLectureStore((s) => s.reset);
  const getElapsedTime = useLectureStore((s) => s.getElapsedTime);
  const segments = useLectureStore((s) => s.segments);

  const elapsed = isRecording ? getElapsedTime() : null;

  return (
    <div className="flex items-center gap-3">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-600 active:scale-95"
        >
          <span className="h-3 w-3 rounded-full bg-white" />
          Start Lecture
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 rounded-lg bg-app-secondary px-5 py-2.5 text-sm font-semibold text-app shadow-md transition hover:opacity-80 active:scale-95"
        >
          <span className="h-3 w-3 rounded-sm bg-red-400" />
          Stop Lecture
        </button>
      )}

      {isRecording && elapsed && (
        <span className="flex items-center gap-1.5 font-mono text-sm text-red-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          {elapsed}
        </span>
      )}

      {segments.length > 0 && !isRecording && (
        <button
          onClick={reset}
          className="rounded-lg border border-app px-4 py-2 text-sm text-app-muted transition hover:text-brand-600"
        >
          New Lecture
        </button>
      )}
    </div>
  );
}
