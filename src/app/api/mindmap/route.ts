import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { transcript, notes } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const markdown = await callLLM(
      `You are a mindmap generator. Create a hierarchical markdown outline of the lecture topics. Use # for the main topic, ## for subtopics, ### for details. This will be rendered as a mindmap diagram. Output ONLY the markdown outline, nothing else.`,
      `Transcript:\n${transcript}\n\nNotes:\n${notes || ""}`,
      { maxTokens: 2048 }
    );

    return NextResponse.json({ markdown });
  } catch (error) {
    console.error("Mindmap generation error:", error);
    return NextResponse.json({ error: "Failed to generate mindmap" }, { status: 500 });
  }
}
