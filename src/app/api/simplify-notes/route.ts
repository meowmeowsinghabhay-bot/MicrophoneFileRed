import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import {
  getSimplifyLevelInstruction,
  normalizeLearningLevel,
} from "@/lib/learning-level";

export async function POST(request: NextRequest) {
  try {
    const { notes, targetLanguage, learningLevel } = await request.json();

    if (!notes) {
      return NextResponse.json({ error: "notes are required" }, { status: 400 });
    }

    const level = normalizeLearningLevel(learningLevel);

    const simplified = await callLLM(
      `You are a patient tutor. Rewrite the given class notes in ${targetLanguage || "English"}.
${getSimplifyLevelInstruction(level)}
Keep the same structure. Use markdown formatting.`,
      notes,
      { maxTokens: 4096 }
    );

    return NextResponse.json({ simplified });
  } catch (error) {
    console.error("Simplified notes error:", error);
    return NextResponse.json({ error: "Failed to simplify notes" }, { status: 500 });
  }
}
