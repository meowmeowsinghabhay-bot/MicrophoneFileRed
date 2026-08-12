import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import {
  getChatLevelInstruction,
  normalizeLearningLevel,
} from "@/lib/learning-level";

export async function POST(request: NextRequest) {
  try {
    const { question, transcript, notes, learningLevel } = await request.json();

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const level = normalizeLearningLevel(learningLevel);

    const answer = await callLLM(
      `You are a helpful classroom assistant. Answer the student's question based ONLY on the lecture transcript and notes provided. If the answer isn't in the lecture content, say so clearly.
${getChatLevelInstruction(level)}`,
      `Student question: ${question}\n\nLecture transcript:\n${transcript || ""}\n\nClass notes:\n${notes || ""}`,
      { maxTokens: 1024 }
    );

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
