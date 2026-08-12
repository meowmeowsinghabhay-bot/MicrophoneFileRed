/**
 * Single LLM provider abstraction — all AI calls route through here.
 * Switch provider/model by editing this file only.
 */
import { callLLM as openaiCall, callLLMWithVision as openaiVision } from "./llm";

export class LLMService {
  static async complete(
    systemPrompt: string,
    userPrompt: string,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<string> {
    return openaiCall(systemPrompt, userPrompt, options);
  }

  static async completeWithVision(
    systemPrompt: string,
    imageBase64: string,
    mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
    userPrompt: string
  ): Promise<string> {
    return openaiVision(systemPrompt, imageBase64, mediaType, userPrompt);
  }

  static async translate(texts: string[], targetLanguage: string): Promise<string[]> {
    if (targetLanguage === "English") return texts;

    const numbered = texts.map((t, i) => `${i + 1}. ${t}`).join("\n");
    const result = await this.complete(
      `Translate each numbered line to ${targetLanguage}. Output ONLY a JSON array of strings in native script.`,
      numbered,
      { maxTokens: 1024, temperature: 0.1 }
    );

    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length === texts.length) {
        return parsed.map(String);
      }
    } catch {
      /* fallback below */
    }
    return texts.map((t) => t);
  }
}
