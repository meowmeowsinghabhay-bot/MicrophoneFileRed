import { createWorker } from "tesseract.js";

export async function fallbackBoardAnalysis(
  base64: string
): Promise<{ description: string; latex: string }> {
  const worker = await createWorker("eng");
  try {
    const buffer = Buffer.from(base64, "base64");
    const {
      data: { text },
    } = await worker.recognize(buffer);
    const cleaned = text.replace(/\s+/g, " ").trim();

    return {
      description: cleaned
        ? `Extracted text (OCR fallback — add OpenAI credits for full diagram/formula analysis):\n\n${cleaned}`
        : "No text could be extracted from this image. Try a clearer photo with better lighting.",
      latex: "",
    };
  } finally {
    await worker.terminate();
  }
}

export function getBoardAnalysisErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("credit_balance_exhausted") || message.includes("no credits")) {
    return "OpenAI credits exhausted — using free OCR fallback instead.";
  }
  if (message.includes("OPENAI_API_KEY")) {
    return "OpenAI API key is missing.";
  }

  return "Failed to analyze board image.";
}
