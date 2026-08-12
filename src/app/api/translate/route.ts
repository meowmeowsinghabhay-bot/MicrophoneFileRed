import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { fallbackTranslate, getTranslationErrorMessage } from "@/lib/translate";
import { LANGUAGES } from "@/lib/constants";
import { LanguageCode } from "@/lib/constants";
import {
  getTranslationLevelInstruction,
  normalizeLearningLevel,
} from "@/lib/learning-level";
import { preserveTerminology } from "@/lib/terminology";

function resolveLanguageCode(targetLanguage: string): LanguageCode | null {
  const match = LANGUAGES.find(
    (l) =>
      l.label.toLowerCase() === targetLanguage.toLowerCase() ||
      l.native === targetLanguage ||
      l.code === targetLanguage
  );
  return match?.code ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const { texts, text, targetLanguage, learningLevel } = await request.json();

    const items: string[] = Array.isArray(texts)
      ? texts.filter((t: string) => t?.trim())
      : text?.trim()
        ? [text.trim()]
        : [];

    if (items.length === 0 || !targetLanguage) {
      return NextResponse.json(
        { error: "texts (or text) and targetLanguage are required" },
        { status: 400 }
      );
    }

    if (targetLanguage === "English") {
      return NextResponse.json({
        translated: items[0],
        translations: items,
        source: "passthrough",
      });
    }

    let translations: string[] | null = null;
    let source: "openai" | "fallback" = "openai";
    const level = normalizeLearningLevel(learningLevel);
    const langCode = resolveLanguageCode(targetLanguage);

    try {
      const numberedInput = items.map((t, i) => `${i + 1}. ${t}`).join("\n");
      const result = await callLLM(
        `You are a real-time classroom caption translator. Translate each numbered line from English to ${targetLanguage}.
Rules:
- ${getTranslationLevelInstruction(level)}
- Output ONLY a JSON array of translated strings, same length and order as input.
- Use the native script for ${targetLanguage}.
- Preserve formulas (e.g. O(log n)) and standard CS/math notation unchanged.
- Do NOT repeat the English text.
Return nothing except the JSON array.`,
        numberedInput,
        { maxTokens: 1024, temperature: 0.1 }
      );

      try {
        const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length === items.length) {
          translations = parsed.map((t) => String(t).trim());
        }
      } catch {
        const lines = result
          .split("\n")
          .map((line) => line.replace(/^\d+\.\s*/, "").trim())
          .filter(Boolean);
        if (lines.length === items.length) translations = lines;
      }

      if (!translations && items.length === 1) {
        const single = await callLLM(
          `Translate this English text to ${targetLanguage}. Output ONLY the translation in native script: "${items[0]}"`,
          items[0],
          { maxTokens: 256, temperature: 0.1 }
        );
        translations = [single.trim()];
      }
    } catch (openaiError) {
      const langCode = resolveLanguageCode(targetLanguage);
      if (langCode) {
        translations = await fallbackTranslate(items, langCode);
        source = "fallback";
      }
      if (!translations) {
        return NextResponse.json(
          { error: getTranslationErrorMessage(openaiError), code: "translation_failed" },
          { status: 503 }
        );
      }
    }

    if (!translations) {
      return NextResponse.json({ error: "Translation format mismatch" }, { status: 500 });
    }

    if (langCode) {
      translations = translations.map((t) => preserveTerminology(t, langCode));
    }

    return NextResponse.json({ translated: translations[0], translations, source });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: getTranslationErrorMessage(error), code: "translation_failed" },
      { status: 500 }
    );
  }
}
