"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLectureStore } from "@/store/lectureStore";
import { useAuthStore } from "@/store/authStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { LANGUAGE_NAMES } from "@/lib/constants";
import { snapshotToApiPayload } from "@/lib/lecture-api";
import {
  saveLecture,
  exportLectureAsText,
  downloadFile,
  SavedLecture,
} from "@/lib/lecture-persistence";

export default function SaveLectureButton() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);
  const segments = useLectureStore((s) => s.segments);
  const getLectureSnapshot = useLectureStore((s) => s.getLectureSnapshot);
  const selectedCourseId = usePreferencesStore((s) => s.selectedCourseId);
  const user = useAuthStore((s) => s.user);

  if (!fullTranscript && segments.length === 0) return null;

  const handleSave = async () => {
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

    // Always keep local backup — existing behavior
    saveLecture(lecture);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Teachers with a real DB session → also persist to server
    if (
      user?.role === "teacher" &&
      user.id !== "demo" &&
      selectedCourseId
    ) {
      setSaving(true);
      setStatus(null);
      try {
        const payload = snapshotToApiPayload(snapshot, selectedCourseId);
        const res = await fetch("/api/lectures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save to database");

        setStatus("Saved to course (draft)");
        if (data.lecture?.id) {
          setTimeout(() => {
            router.push(`/teacher/courses/${selectedCourseId}`);
          }, 800);
        }
      } catch (err) {
        setStatus(
          err instanceof Error ? err.message : "Local save OK · DB save failed"
        );
      } finally {
        setSaving(false);
      }
    } else if (user?.role === "teacher" && !selectedCourseId) {
      setStatus("Saved locally · select a course to save to DB");
    } else {
      setStatus("Saved locally");
    }
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
      `intellishala-${lang}-${new Date().toISOString().slice(0, 10)}.txt`
    );
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg border border-app bg-app-card px-4 py-2 text-sm font-medium text-app transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save Lecture"}
        </button>
        <button
          onClick={handleExport}
          className="rounded-lg border border-app bg-app-card px-4 py-2 text-sm font-medium text-app-muted transition hover:text-brand-600"
        >
          Export .txt
        </button>
      </div>
      {status && <p className="max-w-xs text-right text-xs text-app-muted">{status}</p>}
    </div>
  );
}
