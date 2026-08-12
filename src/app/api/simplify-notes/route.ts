import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { notes, targetLanguage } = await request.json();

    if (!notes) {
      return NextResponse.json({ error: "notes are required" }, { status: 400 });
    }

    const simplified = await callLLM(
      `You are a patient tutor. Rewrite the given class notes in ${targetLanguage || "English"} using simple language — explain like the student is completely new to the topic. Keep the same structure but use everyday analogies and simpler words. Use markdown formatting.`,
      notes,
      { maxTokens: 4096 }
    );

    return NextResponse.json({ simplified });
  } catch (error) {
    console.error("Simplified notes error:", error);
    return NextResponse.json({ error: "Failed to simplify notes" }, { status: 500 });
  }
}
