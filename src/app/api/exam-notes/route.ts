import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { transcript, notes, importantLines } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const importantContext = importantLines?.length
      ? `\n\nLines flagged as important:\n${importantLines.join("\n")}`
      : "";

    const result = await callLLM(
      `You are an exam question generator. Based on the lecture content, generate likely exam questions. Include both short-answer (2-3 sentences) and long-answer (paragraph) questions.

Respond in JSON array format ONLY:
[
  {"type": "short", "question": "...", "hint": "optional hint"},
  {"type": "long", "question": "...", "hint": "optional hint"}
]

Generate 4-6 questions total, mixing short and long answer types.`,
      `Transcript:\n${transcript}\n\nNotes:\n${notes || ""}${importantContext}`,
      { maxTokens: 2048 }
    );

    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
      const questions = JSON.parse(cleaned);
      return NextResponse.json({ questions });
    } catch {
      return NextResponse.json({ questions: [] });
    }
  } catch (error) {
    console.error("Exam notes error:", error);
    return NextResponse.json({ error: "Failed to generate exam questions" }, { status: 500 });
  }
}
