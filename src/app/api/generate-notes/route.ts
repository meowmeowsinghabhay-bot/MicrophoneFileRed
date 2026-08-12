import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { transcript, boardDescriptions, targetLanguage } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const boardContext = boardDescriptions?.length
      ? `\n\nBoard/Slide content captured during lecture:\n${boardDescriptions.join("\n\n")}`
      : "";

    const notes = await callLLM(
      `You are an expert classroom note-taker. Generate well-structured class notes in ${targetLanguage || "English"} from the lecture transcript. Use markdown formatting with headings (##), bullet points, and preserve technical terms and formulas. Be comprehensive but organized.`,
      `Lecture transcript:\n${transcript}${boardContext}`,
      { maxTokens: 4096 }
    );

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Notes generation error:", error);
    return NextResponse.json({ error: "Failed to generate notes" }, { status: 500 });
  }
}
