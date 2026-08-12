"use client";

/** Browser speech synthesis — client-only, Vercel-friendly. */

const SPEECH_LANG: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  bn: "bn-IN",
  ar: "ar-SA",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  es: "es-ES",
  fr: "fr-FR",
};

const LANG_ALIASES: Record<string, string> = {
  english: "en",
  hindi: "hi",
  bangla: "bn",
  bengali: "bn",
  arabic: "ar",
  tamil: "ta",
  telugu: "te",
  marathi: "mr",
  spanish: "es",
  french: "fr",
};

let voicesCache: SpeechSynthesisVoice[] = [];
let voicesReady = false;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function normalizeLangCode(code?: string | null): string {
  if (!code) return "en";
  const raw = code.trim().toLowerCase();
  if (raw in SPEECH_LANG) return raw;
  if (raw in LANG_ALIASES) return LANG_ALIASES[raw];
  if (raw.includes("-")) return raw.split("-")[0];
  return raw;
}

export function resolveSpeechLang(code?: string | null): string {
  const normalized = normalizeLangCode(code);
  return SPEECH_LANG[normalized] || normalized;
}

/** Preload voices — getVoices() is empty until voiceschanged on many browsers. */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isTTSSupported()) return Promise.resolve([]);
  if (voicesReady && voicesCache.length > 0) return Promise.resolve(voicesCache);

  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const sync = () => {
        const list = window.speechSynthesis.getVoices();
        if (list.length > 0) {
          voicesCache = list;
          voicesReady = true;
          resolve(list);
          return true;
        }
        return false;
      };

      if (sync()) return;

      const onVoicesChanged = () => {
        if (sync()) {
          window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
        }
      };

      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
      // Chrome sometimes needs a nudge
      window.speechSynthesis.getVoices();

      setTimeout(() => {
        if (!voicesReady) {
          voicesCache = window.speechSynthesis.getVoices();
          voicesReady = true;
          resolve(voicesCache);
        }
      }, 800);
    });
  }

  return voicesPromise;
}

function langPrefix(code?: string | null): string {
  return normalizeLangCode(code);
}

function scoreVoice(voice: SpeechSynthesisVoice, prefix: string, locale: string): number {
  const vLang = voice.lang.toLowerCase().replace("_", "-");
  let score = 0;

  if (vLang === locale.toLowerCase()) score += 100;
  if (vLang.startsWith(`${prefix}-`)) score += 80;
  if (vLang === prefix) score += 70;
  if (vLang.startsWith(prefix)) score += 50;

  // Prefer local / offline voices (usually better on Windows)
  if (voice.localService) score += 15;
  if (!voice.default) score += 5;

  // Prefer voices whose names hint at the target language
  const name = voice.name.toLowerCase();
  const hints: Record<string, string[]> = {
    hi: ["hindi", "hemant", "swara", "madhur"],
    bn: ["bengali", "bangla", "bashkar", "tanishaa"],
    ta: ["tamil", "valluvar", "pallavi"],
    te: ["telugu", "mohan", "shruti"],
    mr: ["marathi", "manohar", "aarti"],
    ar: ["arabic", "naayf", "hoda", "salma"],
    es: ["spanish", "helena", "pablo"],
    fr: ["french", "denise", "henri"],
  };
  for (const hint of hints[prefix] || []) {
    if (name.includes(hint)) score += 25;
  }

  return score;
}

export function findVoiceForLang(
  voices: SpeechSynthesisVoice[],
  langCode?: string | null
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const prefix = langPrefix(langCode);
  const locale = resolveSpeechLang(langCode);

  const ranked = voices
    .map((voice) => ({ voice, score: scoreVoice(voice, prefix, locale) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 0) return ranked[0].voice;

  // Never use English voice for non-Latin scripts — sounds broken
  if (prefix === "en") {
    return voices.find((v) => v.lang.toLowerCase().startsWith("en")) || voices[0];
  }

  return null;
}

export function hasNativeVoice(langCode?: string | null): boolean {
  if (!isTTSSupported()) return false;
  return findVoiceForLang(voicesCache, langCode) !== null;
}

export type SpeakResult =
  | { ok: true }
  | { ok: false; reason: "unsupported" | "no-voice" | "error" };

export async function speakText(
  text: string,
  langCode?: string | null
): Promise<SpeakResult> {
  if (!isTTSSupported() || !text.trim()) {
    return { ok: false, reason: "unsupported" };
  }

  const voices = await loadVoices();
  const voice = findVoiceForLang(voices, langCode);

  if (!voice && langPrefix(langCode) !== "en") {
    return { ok: false, reason: "no-voice" };
  }

  window.speechSynthesis.cancel();

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text.trim());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = resolveSpeechLang(langCode);
    }
    utterance.rate = 0.92;
    utterance.pitch = 1;

    utterance.onend = () => resolve({ ok: true });
    utterance.onerror = () => resolve({ ok: false, reason: "error" });

    // Chrome/Edge: small delay after cancel avoids silent failures
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 60);
  });
}

export function stopSpeaking(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function voiceInstallHint(langCode?: string | null): string {
  const prefix = langPrefix(langCode);
  const labels: Record<string, string> = {
    hi: "Hindi",
    bn: "Bangla",
    ta: "Tamil",
    te: "Telugu",
    mr: "Marathi",
    ar: "Arabic",
    es: "Spanish",
    fr: "French",
  };
  const label = labels[prefix] || "this language";
  return `No ${label} voice found. Install the ${label} speech pack in Windows Settings → Time & language → Speech, or use Microsoft Edge.`;
}
