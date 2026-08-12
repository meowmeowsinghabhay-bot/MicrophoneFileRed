"use client";

import { useState } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { useAuthStore } from "@/store/authStore";
import { LANGUAGE_NAMES } from "@/lib/constants";
import {
  saveLecture,
  exportLectureAsText,
  downloadFile,
  SavedLecture,
} from "@/lib/lecture-persistence";

export default function SaveLectureButton() {
  const [saved, setSaved] = useState(false);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);
  const segments = useLectureStore((s) => s.segments);
  const getLectureSnapshot = useLectureStore((s) => s.getLectureSnapshot);
  const user = useAuthStore((s) => s.user);

  if (!fullTranscript && segments.length === 0) return null;

  const handleSave = () => {
    const snapshot = getLectureSnapshot();
    const title =
      snapshot.fullTranscript.slice(0, 50).trim() +
        (snapshot.fullTranscript.length > 50 ? "…" : "") ||
      `Lecture ${new Date().toLocaleDateString()}`;

    const lecture: SavedLecture = {
      id: `lecture-${Date.now()}`,
      title,
      savedAt: Date.now(),
      savedBy: user?.username || "unknown",
      role: user?.role || "student",
      ...snapshot,
    };

    saveLecture(lecture);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const snapshot = getLectureSnapshot();
    const lecture: SavedLecture = {
      id: "export",
      title: "Lecture Export",
      savedAt: Date.now(),
      savedBy: user?.username || "unknown",
      role: user?.role || "student",
      ...snapshot,
    };
    const text = exportLectureAsText(lecture);
    const lang = LANGUAGE_NAMES[snapshot.targetLanguage];
    downloadFile(
      text,
      `intelliclassroom-${lang}-${new Date().toISOString().slice(0, 10)}.txt`
    );
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSave}
        className="rounded-lg border border-app bg-app-card px-4 py-2 text-sm font-medium text-app transition hover:border-brand-500 hover:text-brand-600"
      >
        {saved ? "✓ Saved" : "Save Lecture"}
      </button>
      <button
        onClick={handleExport}
        className="rounded-lg border border-app bg-app-card px-4 py-2 text-sm font-medium text-app-muted transition hover:text-brand-600"
      >
        Export .txt
      </button>
    </div>
  );
}
