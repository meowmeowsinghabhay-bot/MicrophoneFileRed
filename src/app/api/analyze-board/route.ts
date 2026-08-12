import { NextRequest, NextResponse } from "next/server";
import { callLLMWithVision } from "@/lib/llm";
import {
  fallbackBoardAnalysis,
  getBoardAnalysisErrorMessage,
} from "@/lib/board-analysis";

export async function POST(request: NextRequest) {
  try {
    const { imageData, mediaType } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: "imageData is required" }, { status: 400 });
    }

    const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = (mediaType || "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp";

    try {
      const result = await callLLMWithVision(
        `You are an expert at reading classroom boards, slides, and diagrams. Analyze the image and provide:
1. A clear text description of everything visible (text, diagrams, formulas, charts)
2. Any mathematical formulas in LaTeX format

Respond in JSON format:
{
  "description": "detailed description here",
  "latex": "LaTeX formulas if any, or empty string"
}`,
        base64,
        mimeType,
        "Analyze this classroom board/slide image. Extract all text, describe diagrams, and transcribe any formulas."
      );

      try {
        const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json({
          description: parsed.description || result,
          latex: parsed.latex || "",
          source: "openai",
        });
      } catch {
        return NextResponse.json({ description: result, latex: "", source: "openai" });
      }
    } catch (openaiError) {
      console.error("OpenAI vision failed, trying OCR fallback:", openaiError);

      const ocrResult = await fallbackBoardAnalysis(base64);
      return NextResponse.json({
        ...ocrResult,
        source: "ocr",
        warning: getBoardAnalysisErrorMessage(openaiError),
      });
    }
  } catch (error) {
    console.error("Board analysis error:", error);
    return NextResponse.json(
      { error: getBoardAnalysisErrorMessage(error) },
      { status: 500 }
    );
  }
}
