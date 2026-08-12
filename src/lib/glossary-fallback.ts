import { TERMINOLOGY } from "./terminology";
import { GlossaryTerm } from "./types";

/** Code-only glossary when OpenAI is unavailable — works on Vercel without API key. */
export function buildFallbackGlossary(
  transcript: string,
  notes?: string,
  targetLanguage = "hi"
): GlossaryTerm[] {
  const combined = `${transcript}\n${notes || ""}`;
  const found = new Map<string, GlossaryTerm>();

  for (const [key, term] of Object.entries(TERMINOLOGY)) {
    const regex = new RegExp(key, "gi");
    if (regex.test(combined)) {
      found.set(term.canonical.toLowerCase(), {
        term: term.canonical,
        definition: `Key classroom term from this lecture (${term.doNotTranslate ? "kept in English" : "translated when appropriate"}).`,
        translation: term.translations?.[targetLanguage],
        category: "term",
      });
    }
  }

  const formulaMatches = combined.match(/O\([^)]+\)/g) || [];
  for (const formula of formulaMatches) {
    if (!found.has(formula.toLowerCase())) {
      found.set(formula.toLowerCase(), {
        term: formula,
        definition: "Time or space complexity notation used in this lecture.",
        category: "formula",
      });
    }
  }

  const conceptPatterns = [
    /binary search tree/gi,
    /data structure/gi,
    /TCP|UDP|OSI model|IP address/gi,
  ];

  for (const pattern of conceptPatterns) {
    const matches = combined.match(pattern) || [];
    for (const match of matches) {
      const term = match.trim();
      const key = term.toLowerCase();
      if (!found.has(key)) {
        found.set(key, {
          term,
          definition: `Important concept discussed in this lecture.`,
          category: "concept",
        });
      }
    }
  }

  return Array.from(found.values()).slice(0, 12);
}
