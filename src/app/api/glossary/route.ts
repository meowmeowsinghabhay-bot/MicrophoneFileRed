import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { LANGUAGE_NAMES, LanguageCode } from "@/lib/constants";
import {
  getGlossaryLevelInstruction,
  normalizeLearningLevel,
} from "@/lib/learning-level";
import { buildFallbackGlossary } from "@/lib/glossary-fallback";
import { GlossaryTerm } from "@/lib/types";

function resolveLangCode(targetLanguage?: string): LanguageCode {
  if (!targetLanguage) return "hi";
  const normalized = targetLanguage.toLowerCase();
  if (normalized in LANGUAGE_NAMES) return normalized as LanguageCode;
  const entry = Object.entries(LANGUAGE_NAMES).find(
    ([, label]) => label.toLowerCase() === targetLanguage.toLowerCase()
  );
  return (entry?.[0] as LanguageCode) || "hi";
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, notes, targetLanguage, learningLevel } = await request.json();

    if (!transcript?.trim() && !notes?.trim()) {
      return NextResponse.json(
        { error: "transcript or notes are required" },
        { status: 400 }
      );
    }

    const level = normalizeLearningLevel(learningLevel);
    const langCode = resolveLangCode(targetLanguage);
    const langLabel = LANGUAGE_NAMES[langCode];

    try {
      const result = await callLLM(
        `You are a classroom glossary generator. Extract 8-12 key terms from the lecture content.
${getGlossaryLevelInstruction(level)}

For each term provide:
- term: the English technical term or formula (keep formulas like O(log n) unchanged)
- definition: clear English definition (1-2 sentences)
- translation: short ${langLabel} explanation in native script (not a duplicate of English)
- category: one of "term", "concept", or "formula"

Respond with ONLY a JSON array:
[{"term":"...","definition":"...","translation":"...","category":"term"}]`,
        `Transcript:\n${transcript || ""}\n\nNotes:\n${notes || ""}`,
        { maxTokens: 2048, temperature: 0.2 }
      );

      const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const terms: GlossaryTerm[] = parsed.map((t) => ({
          term: String(t.term || "").trim(),
          definition: String(t.definition || "").trim(),
          translation: t.translation ? String(t.translation).trim() : undefined,
          category: (["term", "concept", "formula"].includes(t.category)
            ? t.category
            : "term") as GlossaryTerm["category"],
        })).filter((t) => t.term && t.definition);

        if (terms.length > 0) {
          return NextResponse.json({ terms, source: "openai" });
        }
      }
    } catch {
      /* fall through to code-only glossary */
    }

    const terms = buildFallbackGlossary(
      transcript || "",
      notes,
      langCode
    );

    return NextResponse.json({ terms, source: "fallback" });
  } catch (error) {
    console.error("Glossary error:", error);
    return NextResponse.json({ error: "Failed to generate glossary" }, { status: 500 });
  }
}
