import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { notes, targetLanguage } = await request.json();

    if (!notes) {
      return NextResponse.json({ error: "notes are required" }, { status: 400 });
    }

    const revision = await callLLM(
      `You are a revision notes compressor. Take the full class notes and compress them into a one-page bullet-point summary in ${targetLanguage || "English"} for quick pre-exam review. Keep only the most essential points, key formulas, and critical definitions. Use markdown bullet points.`,
      notes,
      { maxTokens: 2048 }
    );

    return NextResponse.json({ revision });
  } catch (error) {
    console.error("Revision notes error:", error);
    return NextResponse.json({ error: "Failed to generate revision notes" }, { status: 500 });
  }
}
