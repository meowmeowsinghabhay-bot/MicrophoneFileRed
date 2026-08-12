import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import { fallbackTranslate, getTranslationErrorMessage } from "@/lib/translate";
import { LANGUAGES, LANGUAGE_NAMES } from "@/lib/constants";
import { LanguageCode } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "generate-all" || (body.transcript?.trim() && !body.texts && !body.text)) {
      return handleGenerateAll(body);
    }

    const { texts, text, targetLanguage } = body;
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

    try {
      const numberedInput = items.map((t, i) => `${i + 1}. ${t}`).join("\n");
      const result = await callLLM(
        `Translate each numbered line from English to ${targetLanguage}. Output ONLY a JSON array of translated strings in native script.`,
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
          `Translate to ${targetLanguage}. Output ONLY the translation: "${items[0]}"`,
          items[0],
          { maxTokens: 256, temperature: 0.1 }
        );
        translations = [single.trim()];
      }
    } catch (openaiError) {
      const langCode = LANGUAGES.find(
        (l) => l.label === targetLanguage || l.native === targetLanguage
      )?.code as LanguageCode | undefined;
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

    return NextResponse.json({ translated: translations[0], translations, source });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: getTranslationErrorMessage(error), code: "translation_failed" },
      { status: 500 }
    );
  }
}

async function handleGenerateAll(body: {
  transcript: string;
  notes?: string;
  targetLanguage?: string;
  importantLines?: string[];
  durationMinutes?: number;
}) {
  const { transcript, notes, targetLanguage, importantLines, durationMinutes } = body;
  if (!transcript?.trim()) {
    return NextResponse.json({ error: "transcript is required" }, { status: 400 });
  }

  const lang = targetLanguage || "English";
  const boardContext = "";

  try {
    const notesResult = await callLLM(
      `Generate structured class notes in ${lang} from this lecture transcript. Use markdown with headings and bullets.`,
      `Transcript:\n${transcript}${boardContext}`,
      { maxTokens: 4096 }
    );

    const [mindmap, timelineRaw, importantRaw, examRaw, revision] = await Promise.all([
      callLLM(
        `Create a hierarchical markdown outline for a mindmap from this lecture. Use # ## ### only.`,
        `Transcript:\n${transcript}\n\nNotes:\n${notesResult}`,
        { maxTokens: 2048 }
      ),
      callLLM(
        `Extract topic segments with timestamps for a ~${durationMinutes || 30} min lecture. Return JSON array: [{"startTime":"0:00","endTime":"4:30","title":"...","description":"..."}]`,
        transcript,
        { maxTokens: 2048 }
      ),
      callLLM(
        `Identify exam-relevant lines from this transcript. Return JSON array of strings, max 15.`,
        transcript,
        { maxTokens: 2048 }
      ),
      callLLM(
        `Generate exam questions from this lecture. Return JSON: [{"type":"short"|"long","question":"...","hint":"..."}]`,
        `Transcript:\n${transcript}\n\nNotes:\n${notesResult}\n\nImportant:\n${(importantLines || []).join("\n")}`,
        { maxTokens: 2048 }
      ),
      callLLM(
        `Compress these notes into a one-page revision summary in ${lang}. Use bullet points.`,
        notesResult,
        { maxTokens: 2048 }
      ),
    ]);

    let timeline = [];
    let important = [];
    let examQuestions = [];
    try {
      timeline = JSON.parse(timelineRaw.replace(/```json\n?|\n?```/g, "").trim());
    } catch { /* keep empty */ }
    try {
      important = JSON.parse(importantRaw.replace(/```json\n?|\n?```/g, "").trim());
    } catch { /* keep empty */ }
    try {
      examQuestions = JSON.parse(examRaw.replace(/```json\n?|\n?```/g, "").trim());
    } catch { /* keep empty */ }

    return NextResponse.json({
      structuredNotes: notesResult,
      mindmapMarkdown: mindmap,
      timeline,
      importantLines: important,
      examQuestions,
      revisionNotes: revision,
    });
  } catch (error) {
    console.error("Generate all error:", error);
    return NextResponse.json({ error: "AI generation failed. Check your OpenAI API key and credits." }, { status: 500 });
  }
}
