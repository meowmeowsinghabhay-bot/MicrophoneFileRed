import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm";
import {
  getExplainBackLevelInstruction,
  normalizeLearningLevel,
} from "@/lib/learning-level";

export async function POST(request: NextRequest) {
  try {
    const { concept, studentExplanation, transcript, notes, learningLevel } =
      await request.json();

    if (!concept || !studentExplanation) {
      return NextResponse.json(
        { error: "concept and studentExplanation are required" },
        { status: 400 }
      );
    }

    const level = normalizeLearningLevel(learningLevel);

    const result = await callLLM(
      `You are a patient tutor evaluating a student's explanation. Compare their explanation against the lecture content.
${getExplainBackLevelInstruction(level)}

Respond in JSON format ONLY:
{
  "score": 75,
  "correct": ["point they got right 1", "point 2"],
  "missed": ["concept they missed 1", "concept 2"],
  "feedback": "Constructive feedback paragraph"
}

Score is 0-100. Be specific about what they got right and what they missed.`,
      `Concept: ${concept}\n\nStudent's explanation:\n${studentExplanation}\n\nLecture transcript:\n${transcript || ""}\n\nClass notes:\n${notes || ""}`,
      { maxTokens: 1024 }
    );

    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
      const evaluation = JSON.parse(cleaned);
      return NextResponse.json({ evaluation });
    } catch {
      return NextResponse.json({
        evaluation: { score: 0, correct: [], missed: [], feedback: result },
      });
    }
  } catch (error) {
    console.error("Explain-back error:", error);
    return NextResponse.json({ error: "Failed to evaluate explanation" }, { status: 500 });
  }
}
