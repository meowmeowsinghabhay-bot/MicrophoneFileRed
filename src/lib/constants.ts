export const APP_NAME = "IntelliShala";
export const APP_TAGLINE = "Multilingual AI Classroom Assistant | Understand. Learn. Achieve.";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bangla", native: "বাংলা" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const LANGUAGE_NAMES: Record<LanguageCode, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.label])
) as Record<LanguageCode, string>;

export const LEARNING_LEVELS = [
  { id: "beginner", label: "Beginner", description: "Explain like I'm new" },
  { id: "standard", label: "Standard", description: "Normal lecture level" },
  { id: "advanced", label: "Advanced", description: "Technical depth" },
] as const;

export type LearningLevel = (typeof LEARNING_LEVELS)[number]["id"];

export const IMPORTANT_KEYWORDS = [
  "important",
  "this is important",
  "note this down",
  "this might come in the exam",
  "this will be in the exam",
  "remember this",
  "pay attention",
  "key point",
  "exam question",
  "write this down",
  "very important",
  "must remember",
  "critical",
];

export const LIVE_TABS = [
  { id: "live", label: "Live Captions", icon: "🎙️" },
  { id: "notes", label: "Notes", icon: "📝" },
  { id: "mindmap", label: "Mindmap", icon: "🧠" },
  { id: "glossary", label: "Glossary", icon: "📖" },
  { id: "timeline", label: "Timeline", icon: "⏱️" },
  { id: "important", label: "Important", icon: "⭐" },
  { id: "exam", label: "Quiz", icon: "📋" },
  { id: "revision", label: "Revision", icon: "📄" },
  { id: "explain", label: "Explain Back", icon: "💬" },
  { id: "chat", label: "Ask AI", icon: "🤖" },
  { id: "board", label: "Board", icon: "📷" },
] as const;

export type TabId = (typeof LIVE_TABS)[number]["id"];

export const LECTURE_VIEWER_TABS = [
  { id: "transcript", label: "Transcript" },
  { id: "notes", label: "Notes" },
  { id: "simplified", label: "Simplified" },
  { id: "formulas", label: "Formulas" },
  { id: "concepts", label: "Concepts" },
  { id: "glossary", label: "Glossary" },
  { id: "board", label: "Board" },
  { id: "mindmap", label: "Mindmap" },
  { id: "important", label: "Important" },
  { id: "revision", label: "Revision" },
  { id: "quiz", label: "Quiz" },
  { id: "explain", label: "Explain Back" },
  { id: "chat", label: "Ask AI" },
  { id: "catchup", label: "Catch Up" },
  { id: "bookmarks", label: "Bookmarks" },
] as const;

export type ViewerTabId = (typeof LECTURE_VIEWER_TABS)[number]["id"];

/** @deprecated use LIVE_TABS */
export const TABS = LIVE_TABS;
