import { LanguageCode } from "./constants";

export interface TranscriptSegment {
  id: string;
  text: string;
  translatedText?: string;
  timestamp: number;
  isFinal: boolean;
  isImportant?: boolean;
  resultIndex?: number;
}

export interface BoardCapture {
  id: string;
  imageData: string;
  description: string;
  latex?: string;
  timestamp: number;
}

export interface TimelineSegment {
  startTime: string;
  endTime: string;
  title: string;
  description: string;
}

export interface ExamQuestion {
  type: "short" | "long";
  question: string;
  hint?: string;
}

export interface ExplainBackResult {
  score: number;
  correct: string[];
  missed: string[];
  feedback: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  translation?: string;
  category: "term" | "concept" | "formula";
}

export interface LectureState {
  isRecording: boolean;
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
  showSimplified: boolean;
  translationError: string | null;
  selectedCourseId: string | null;
  glossaryTerms: GlossaryTerm[];
}
