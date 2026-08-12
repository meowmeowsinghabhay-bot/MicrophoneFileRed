import { create } from "zustand";
import { IMPORTANT_KEYWORDS } from "@/lib/constants";
import {
  BoardCapture,
  ChatMessage,
  ExamQuestion,
  LectureState,
  TimelineSegment,
  TranscriptSegment,
} from "@/lib/types";
import { LanguageCode } from "@/lib/constants";

function checkImportant(text: string): boolean {
  const lower = text.toLowerCase();
  return IMPORTANT_KEYWORDS.some((kw) => lower.includes(kw));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface LectureActions {
  setTargetLanguage: (lang: LanguageCode) => void;
  startRecording: () => void;
  stopRecording: () => void;
  addSegment: (text: string, isFinal: boolean, resultIndex?: number) => void;
  updateSegmentTranslation: (id: string, translatedText: string) => void;
  updateSegmentTranslations: (
    updates: Array<{ id: string; translatedText: string }>
  ) => void;
  addBoardCapture: (capture: BoardCapture) => void;
  setStructuredNotes: (notes: string) => void;
  setSimplifiedNotes: (notes: string) => void;
  setMindmapMarkdown: (markdown: string) => void;
  setTimeline: (timeline: TimelineSegment[]) => void;
  addImportantFromLLM: (lines: string[]) => void;
  setExamQuestions: (questions: ExamQuestion[]) => void;
  setRevisionNotes: (notes: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  toggleSimplified: () => void;
  setTranslationError: (error: string | null) => void;
  setSelectedCourseId: (courseId: string | null) => void;
  loadLectureData: (data: Partial<LectureState>) => void;
  getLectureSnapshot: () => Omit<LectureState, "isRecording" | "translationError">;
  reset: () => void;
  getFullTranscript: () => string;
  getElapsedTime: () => string;
}

const initialState: LectureState = {
  isRecording: false,
  targetLanguage: "hi",
  segments: [],
  fullTranscript: "",
  boardCaptures: [],
  structuredNotes: "",
  simplifiedNotes: "",
  mindmapMarkdown: "",
  timeline: [],
  importantLines: [],
  examQuestions: [],
  revisionNotes: "",
  chatMessages: [],
  recordingStartTime: null,
  showSimplified: false,
  translationError: null,
  selectedCourseId: null,
};

export const useLectureStore = create<LectureState & LectureActions>((set, get) => ({
  ...initialState,

  setTargetLanguage: (lang) =>
    set((state) => ({
      targetLanguage: lang,
      segments: state.segments.map((s) => ({
        ...s,
        translatedText: undefined,
      })),
    })),

  startRecording: () =>
    set({
      isRecording: true,
      recordingStartTime: Date.now(),
      segments: [],
      fullTranscript: "",
      importantLines: [],
    }),

  stopRecording: () => set({ isRecording: false }),

  addSegment: (text, isFinal, resultIndex) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const isImportant = checkImportant(trimmed);

    set((state) => {
      const newSegments = [...state.segments];

      const existingIdx =
        typeof resultIndex === "number"
          ? newSegments.findIndex((s) => s.resultIndex === resultIndex)
          : -1;

      if (existingIdx >= 0) {
        const existing = newSegments[existingIdx];
        newSegments[existingIdx] = {
          ...existing,
          text: trimmed,
          isFinal,
          isImportant: isImportant || existing.isImportant,
          timestamp: Date.now(),
        };
      } else if (!isFinal) {
        newSegments.push({
          id: generateId(),
          text: trimmed,
          timestamp: Date.now(),
          isFinal: false,
          isImportant,
          resultIndex,
        });
      } else {
        const lastIdx = newSegments.length - 1;
        if (lastIdx >= 0 && !newSegments[lastIdx].isFinal) {
          newSegments[lastIdx] = {
            ...newSegments[lastIdx],
            text: trimmed,
            isFinal: true,
            isImportant: isImportant || newSegments[lastIdx].isImportant,
            timestamp: Date.now(),
          };
        } else if (
          lastIdx >= 0 &&
          newSegments[lastIdx].isFinal &&
          newSegments[lastIdx].text === trimmed
        ) {
          return state;
        } else {
          newSegments.push({
            id: generateId(),
            text: trimmed,
            timestamp: Date.now(),
            isFinal: true,
            isImportant,
            resultIndex,
          });
        }
      }

      const fullTranscript = newSegments
        .filter((s) => s.isFinal)
        .map((s) => s.text)
        .join(" ");

      const lastSegment = newSegments[newSegments.length - 1];
      const importantLines =
        isImportant && lastSegment?.isFinal
          ? state.importantLines.some((l) => l.text === trimmed)
            ? state.importantLines
            : [...state.importantLines, lastSegment]
          : state.importantLines;

      return { segments: newSegments, fullTranscript, importantLines };
    });
  },

  updateSegmentTranslation: (id, translatedText) =>
    set((state) => ({
      segments: state.segments.map((s) =>
        s.id === id ? { ...s, translatedText } : s
      ),
    })),

  updateSegmentTranslations: (updates) =>
    set((state) => {
      const map = new Map(updates.map((u) => [u.id, u.translatedText]));
      return {
        segments: state.segments.map((s) =>
          map.has(s.id) ? { ...s, translatedText: map.get(s.id) } : s
        ),
      };
    }),

  addBoardCapture: (capture) =>
    set((state) => ({
      boardCaptures: [...state.boardCaptures, capture],
    })),

  setStructuredNotes: (notes) => set({ structuredNotes: notes }),
  setSimplifiedNotes: (notes) => set({ simplifiedNotes: notes }),
  setMindmapMarkdown: (markdown) => set({ mindmapMarkdown: markdown }),
  setTimeline: (timeline) => set({ timeline }),
  setExamQuestions: (questions) => set({ examQuestions: questions }),
  setRevisionNotes: (notes) => set({ revisionNotes: notes }),

  addImportantFromLLM: (lines) =>
    set((state) => {
      const existing = new Set(state.importantLines.map((l) => l.text));
      const newImportant: TranscriptSegment[] = lines
        .filter((line) => !existing.has(line))
        .map((text) => ({
          id: generateId(),
          text,
          timestamp: Date.now(),
          isFinal: true,
          isImportant: true,
        }));
      return { importantLines: [...state.importantLines, ...newImportant] };
    }),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  toggleSimplified: () => set((state) => ({ showSimplified: !state.showSimplified })),

  setTranslationError: (error) => set({ translationError: error }),

  setSelectedCourseId: (courseId) => set({ selectedCourseId: courseId }),

  loadLectureData: (data) =>
    set((state) => ({
      ...state,
      ...data,
      isRecording: false,
      translationError: null,
    })),

  getLectureSnapshot: () => {
    const s = get();
    return {
      targetLanguage: s.targetLanguage,
      segments: s.segments,
      fullTranscript: s.fullTranscript,
      boardCaptures: s.boardCaptures,
      structuredNotes: s.structuredNotes,
      simplifiedNotes: s.simplifiedNotes,
      mindmapMarkdown: s.mindmapMarkdown,
      timeline: s.timeline,
      importantLines: s.importantLines,
      examQuestions: s.examQuestions,
      revisionNotes: s.revisionNotes,
      chatMessages: s.chatMessages,
      recordingStartTime: s.recordingStartTime,
      showSimplified: s.showSimplified,
      selectedCourseId: s.selectedCourseId,
    };
  },

  reset: () => set(initialState),

  getFullTranscript: () => get().fullTranscript,

  getElapsedTime: () => {
    const start = get().recordingStartTime;
    if (!start) return "0:00";
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },
}));
