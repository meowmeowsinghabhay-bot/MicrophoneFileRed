import { LanguageCode } from "./constants";
import {
  BoardCapture,
  ChatMessage,
  ExamQuestion,
  TimelineSegment,
  TranscriptSegment,
} from "./types";

export interface SavedLecture {
  id: string;
  title: string;
  savedAt: number;
  savedBy: string;
  role: "student" | "teacher";
  targetLanguage: LanguageCode;
  fullTranscript: string;
  segments: TranscriptSegment[];
  boardCaptures: BoardCapture[];
  structuredNotes: string;
  simplifiedNotes: string;
  mindmapMarkdown: string;
  timeline: TimelineSegment[];
  importantLines: TranscriptSegment[];
  examQuestions: ExamQuestion[];
  revisionNotes: string;
  chatMessages: ChatMessage[];
}

const STORAGE_KEY = "intelliclassroom_lectures";

export function getSavedLectures(): SavedLecture[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLecture(lecture: SavedLecture): void {
  const existing = getSavedLectures();
  const idx = existing.findIndex((l) => l.id === lecture.id);
  if (idx >= 0) {
    existing[idx] = lecture;
  } else {
    existing.unshift(lecture);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
}

export function deleteLecture(id: string): void {
  const filtered = getSavedLectures().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function exportLectureAsText(lecture: SavedLecture): string {
  const lines = [
    `IntelliClassroom — Saved Lecture`,
    `Title: ${lecture.title}`,
    `Saved: ${new Date(lecture.savedAt).toLocaleString()}`,
    ``,
    `=== TRANSCRIPT ===`,
    lecture.fullTranscript,
    ``,
  ];

  if (lecture.segments.some((s) => s.translatedText)) {
    lines.push(`=== TRANSLATED CAPTIONS ===`);
    lecture.segments
      .filter((s) => s.isFinal)
      .forEach((s) => {
        lines.push(`EN: ${s.text}`);
        if (s.translatedText) lines.push(`TR: ${s.translatedText}`);
        lines.push(``);
      });
  }

  if (lecture.structuredNotes) {
    lines.push(`=== CLASS NOTES ===`, lecture.structuredNotes, ``);
  }
  if (lecture.revisionNotes) {
    lines.push(`=== REVISION NOTES ===`, lecture.revisionNotes, ``);
  }
  if (lecture.importantLines.length) {
    lines.push(`=== IMPORTANT POINTS ===`);
    lecture.importantLines.forEach((l) => lines.push(`⭐ ${l.text}`));
    lines.push(``);
  }
  if (lecture.examQuestions.length) {
    lines.push(`=== EXAM QUESTIONS ===`);
    lecture.examQuestions.forEach((q, i) =>
      lines.push(`Q${i + 1} (${q.type}): ${q.question}`)
    );
  }

  return lines.join("\n");
}

export function downloadFile(content: string, filename: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
