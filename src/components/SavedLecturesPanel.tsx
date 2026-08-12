"use client";

import { useEffect, useState } from "react";
import { getSavedLectures, deleteLecture, SavedLecture } from "@/lib/lecture-persistence";
import { useLectureStore } from "@/store/lectureStore";

export default function SavedLecturesPanel() {
  const [lectures, setLectures] = useState<SavedLecture[]>([]);
  const [open, setOpen] = useState(false);
  const loadLectureData = useLectureStore((s) => s.loadLectureData);

  const refresh = () => setLectures(getSavedLectures());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("lecture-saved", handler);
    return () => window.removeEventListener("lecture-saved", handler);
  }, []);

  const handleLoad = (lecture: SavedLecture) => {
    loadLectureData({
      targetLanguage: lecture.targetLanguage,
      segments: lecture.segments,
      fullTranscript: lecture.fullTranscript,
      boardCaptures: lecture.boardCaptures,
      structuredNotes: lecture.structuredNotes,
      simplifiedNotes: lecture.simplifiedNotes,
      mindmapMarkdown: lecture.mindmapMarkdown,
      timeline: lecture.timeline,
      importantLines: lecture.importantLines,
      examQuestions: lecture.examQuestions,
      revisionNotes: lecture.revisionNotes,
      chatMessages: lecture.chatMessages,
      recordingStartTime: lecture.savedAt,
    });
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteLecture(id);
    refresh();
  };

  if (lectures.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-app bg-app-card px-3 py-2 text-sm text-app-muted transition hover:text-brand-600"
      >
        Saved ({lectures.length})
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-app bg-app-card p-3 shadow-app">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-app-muted">
            Saved Lectures
          </p>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {lectures.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-lg bg-app-secondary p-3"
              >
                <button onClick={() => handleLoad(l)} className="flex-1 text-left">
                  <p className="truncate text-sm font-medium text-app">{l.title}</p>
                  <p className="text-xs text-app-muted">
                    {new Date(l.savedAt).toLocaleDateString()} · {l.role}
                  </p>
                </button>
                <button
                  onClick={() => handleDelete(l.id)}
                  className="ml-2 text-xs text-red-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
