import { LearningLevel } from "./constants";

export function normalizeLearningLevel(level?: string | null): LearningLevel {
  if (level === "beginner" || level === "advanced") return level;
  return "standard";
}

export function getTranslationLevelInstruction(level: LearningLevel): string {
  switch (level) {
    case "beginner":
      return "Use simple everyday words for someone new to the subject. Explain jargon briefly when needed.";
    case "advanced":
      return "Preserve technical terminology, formulas, and academic precision exactly.";
    default:
      return "Use clear classroom-appropriate language.";
  }
}

export function getSimplifyLevelInstruction(level: LearningLevel): string {
  switch (level) {
    case "beginner":
      return "Explain like the student is completely new. Use analogies and very simple words.";
    case "advanced":
      return "Keep technical depth but improve clarity. Do not remove formulas or formal terms.";
    default:
      return "Use accessible language while keeping important terms.";
  }
}

export function getChatLevelInstruction(level: LearningLevel): string {
  switch (level) {
    case "beginner":
      return "Answer in simple language with short sentences and examples.";
    case "advanced":
      return "Answer with technical depth suitable for an advanced student.";
    default:
      return "Answer clearly at a normal lecture level.";
  }
}

export function getExplainBackLevelInstruction(level: LearningLevel): string {
  switch (level) {
    case "beginner":
      return "Be encouraging and lenient. Reward partial understanding. Score generously for correct intuition.";
    case "advanced":
      return "Be strict on technical accuracy and precise terminology.";
    default:
      return "Be fair and constructive. Balance accuracy with encouragement.";
  }
}

export function getGlossaryLevelInstruction(level: LearningLevel): string {
  switch (level) {
    case "beginner":
      return "Definitions should be very simple, one sentence each, with an everyday analogy when helpful.";
    case "advanced":
      return "Definitions should be precise and include formal terminology where appropriate.";
    default:
      return "Definitions should be clear and classroom-appropriate.";
  }
}
