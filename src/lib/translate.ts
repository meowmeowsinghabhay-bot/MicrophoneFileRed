import { LanguageCode } from "./constants";

const TARGET_CODES: Partial<Record<LanguageCode, string>> = {
  hi: "hi", bn: "bn", ar: "ar", ta: "ta", te: "te", mr: "mr", es: "es", fr: "fr",
};

async function translateWithMyMemory(
  text: string,
  target: string
): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `en|${target}`);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("MyMemory request failed");

  const data = await response.json();
  const translated = data?.responseData?.translatedText?.trim();
  if (!translated) throw new Error("No translation returned");

  return translated;
}

export async function fallbackTranslate(
  texts: string[],
  targetLanguage: LanguageCode
): Promise<string[] | null> {
  const target = TARGET_CODES[targetLanguage];
  if (!target) return null;

  try {
    const results = await Promise.all(
      texts.map((text) => translateWithMyMemory(text, target))
    );
    return results;
  } catch {
    return null;
  }
}

export function getTranslationErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("credit_balance_exhausted") || message.includes("no credits")) {
    return "OpenAI credits exhausted. Add billing at platform.openai.com — a free fallback translator will be tried automatically.";
  }
  if (message.includes("OPENAI_API_KEY")) {
    return "OpenAI API key is missing. Add OPENAI_API_KEY to your .env file.";
  }
  if (message.includes("401") || message.includes("invalid_api_key")) {
    return "Invalid OpenAI API key. Check your OPENAI_API_KEY in .env.";
  }
  if (message.includes("429")) {
    return "OpenAI rate limit hit. Please wait a moment and try again.";
  }

  return "Translation service unavailable. Check your API key and billing.";
}
