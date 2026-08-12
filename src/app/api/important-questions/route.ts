import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const result = await callLLM(
      `You are an exam preparation assistant. Read the full lecture transcript and identify lines that are conceptually important, exam-relevant, or emphasize key concepts — even if the lecturer didn't explicitly say "important."

Respond in JSON array format ONLY — each item is a direct quote or close paraphrase from the transcript:
["line 1", "line 2", ...]

Return at most 15 important lines.`,
      transcript,
      { maxTokens: 2048 }
    );

    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
      const lines = JSON.parse(cleaned);
      return NextResponse.json({ lines });
    } catch {
      return NextResponse.json({ lines: [] });
    }
  } catch (error) {
    console.error("Important questions error:", error);
    return NextResponse.json({ error: "Failed to detect important content" }, { status: 500 });
  }
}
