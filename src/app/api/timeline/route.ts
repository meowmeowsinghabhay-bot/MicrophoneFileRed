import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const { transcript, durationMinutes } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const result = await callLLM(
      `You are a lecture timeline analyzer. Extract topic segments from the transcript with approximate timestamps. The lecture is approximately ${durationMinutes || 30} minutes long. Distribute timestamps proportionally based on content.

Respond in JSON array format ONLY:
[
  {"startTime": "0:00", "endTime": "4:30", "title": "Topic Title", "description": "Brief description"},
  ...
]`,
      transcript,
      { maxTokens: 2048 }
    );

    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
      const timeline = JSON.parse(cleaned);
      return NextResponse.json({ timeline });
    } catch {
      return NextResponse.json({ timeline: [], raw: result });
    }
  } catch (error) {
    console.error("Timeline generation error:", error);
    return NextResponse.json({ error: "Failed to generate timeline" }, { status: 500 });
  }
}
