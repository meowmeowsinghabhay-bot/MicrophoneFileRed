import { LanguageCode } from "./constants";
import {
  BoardCapture,
  ChatMessage,
  ExamQuestion,
  GlossaryTerm,
  TimelineSegment,
  TranscriptSegment,
} from "./types";

export interface LectureSnapshotInput {
  targetLanguage: LanguageCode;
  segments: TranscriptSegment[];
  fullTranscript: string;
  boardCaptures: BoardCapture[];
  structuredNotes: string;
  simplifiedNotes: string;
  mindmapMarkdown: string;
  timeline: TimelineSegment[];
  importantLines: TranscriptSegment[];
  examQuestions: ExamQuestion[];
  revisionNotes: string;
  chatMessages: ChatMessage[];
  recordingStartTime: number | null;
  glossaryTerms: GlossaryTerm[];
}

export function buildLectureTitle(fullTranscript: string): string {
  const trimmed = fullTranscript.slice(0, 50).trim();
  return trimmed + (fullTranscript.length > 50 ? "…" : "") || `Lecture ${new Date().toLocaleDateString()}`;
}

export function snapshotToApiPayload(snapshot: LectureSnapshotInput, courseId: string) {
  const recordingStart = snapshot.recordingStartTime ?? snapshot.segments[0]?.timestamp ?? Date.now();
  const finals = snapshot.segments.filter((s) => s.isFinal && s.text.trim());

  const segments = finals.map((s, i) => {
    const startMs = Math.max(0, s.timestamp - recordingStart);
    const next = finals[i + 1];
    const endMs = next ? Math.max(startMs + 500, next.timestamp - recordingStart) : startMs + 3000;
    return {
      text: s.text,
      translatedText: s.translatedText,
      startMs,
      endMs,
      isImportant: s.isImportant ?? false,
    };
  });

  const contentBlocks: { type: string; content: string; status?: string }[] = [];

  if (snapshot.structuredNotes.trim()) {
    contentBlocks.push({ type: "notes", content: snapshot.structuredNotes });
  }
  if (snapshot.simplifiedNotes.trim()) {
    contentBlocks.push({ type: "simplified", content: snapshot.simplifiedNotes });
  }
  if (snapshot.mindmapMarkdown.trim()) {
    contentBlocks.push({ type: "mindmap", content: snapshot.mindmapMarkdown });
  }
  if (snapshot.revisionNotes.trim()) {
    contentBlocks.push({ type: "revision", content: snapshot.revisionNotes });
  }
  if (snapshot.examQuestions.length > 0) {
    contentBlocks.push({ type: "quiz", content: JSON.stringify(snapshot.examQuestions) });
  }
  if (snapshot.importantLines.length > 0) {
    contentBlocks.push({
      type: "important",
      content: JSON.stringify(snapshot.importantLines.map((l) => l.text)),
    });
  }
  if (snapshot.boardCaptures.length > 0) {
    contentBlocks.push({
      type: "board",
      content: snapshot.boardCaptures
        .map((c) => `[${new Date(c.timestamp).toLocaleTimeString()}]\n${c.description}`)
        .join("\n\n"),
    });
  }
  if (snapshot.glossaryTerms.length > 0) {
    contentBlocks.push({
      type: "glossary",
      content: JSON.stringify(snapshot.glossaryTerms),
      status: "AI Generated",
    });
  }

  const durationMs =
    segments.length > 0 ? segments[segments.length - 1].endMs : undefined;

  return {
    courseId,
    title: buildLectureTitle(snapshot.fullTranscript),
    description: `Recorded live · ${new Date().toLocaleString()}`,
    segments,
    contentBlocks,
    durationMs,
    language: snapshot.targetLanguage,
  };
}
