"use client";

import { useEffect, useState } from "react";
import {
  speakText,
  stopSpeaking,
  isTTSSupported,
  loadVoices,
  hasNativeVoice,
  voiceInstallHint,
} from "@/lib/tts";

interface SpeakButtonProps {
  text: string;
  langCode?: string | null;
  label?: string;
  className?: string;
}

export default function SpeakButton({
  text,
  langCode,
  label = "Read aloud",
  className = "",
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(true);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (!isTTSSupported()) return;
    loadVoices().then(() => {
      setReady(true);
      const ok = hasNativeVoice(langCode);
      setAvailable(ok);
      if (!ok && langCode && langCode !== "en") {
        setHint(voiceInstallHint(langCode));
      }
    });
  }, [langCode]);

  if (!isTTSSupported() || !text.trim()) return null;

  const handleClick = async () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    if (!available) return;

    setSpeaking(true);
    const result = await speakText(text, langCode);

    if (!result.ok) {
      setSpeaking(false);
      if (result.reason === "no-voice") {
        setAvailable(false);
        setHint(voiceInstallHint(langCode));
      }
      return;
    }

    setTimeout(() => setSpeaking(false), Math.min(text.length * 65, 15000));
  };

  const disabled = !ready || !available;

  return (
    <span className="inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={disabled && hint ? hint : label}
        aria-label={label}
        className={`inline-flex items-center gap-1 rounded-lg border border-app bg-app-card px-2 py-1 text-[10px] font-medium transition ${
          disabled
            ? "cursor-not-allowed opacity-40"
            : "text-app-muted hover:border-brand-500/40 hover:text-brand-600"
        } ${className}`}
      >
        {speaking ? "⏹ Stop" : disabled && hint ? "🔇 N/A" : "🔊 Listen"}
      </button>
    </span>
  );
}
