"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { getSpeechRecognitionLocale } from "@/lib/constants";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

async function warmupMicrophone(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: false,
      autoGainControl: true,
      channelCount: 1,
    },
  });
}

function getErrorMessage(error: string): string {
  switch (error) {
    case "not-allowed":
      return "Microphone access denied. Click the lock icon in your address bar and allow microphone access, then refresh.";
    case "no-speech":
      return "No speech detected. Speak closer to the microphone.";
    case "audio-capture":
      return "No microphone found. Check that a mic is connected and enabled in Windows settings.";
    case "network":
      return "Speech recognition needs an internet connection (Chrome uses Google's servers).";
    case "language-not-supported":
      return "This speech language is not supported in your browser. Try English or another language.";
    default:
      return `Speech recognition error: ${error}`;
  }
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRecording = useLectureStore((s) => s.isRecording);
  const speechLanguage = useLectureStore((s) => s.speechLanguage);
  const speechLanguageRef = useRef(speechLanguage);
  const addSegment = useLectureStore((s) => s.addSegment);

  useEffect(() => {
    speechLanguageRef.current = speechLanguage;
  }, [speechLanguage]);

  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const stopMic = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    setIsListening(false);
  }, []);

  const startRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getSpeechRecognitionLocale(speechLanguageRef.current);

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setError(null);
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        if (!transcript) continue;
        addSegment(transcript, result.isFinal, i);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      setError(getErrorMessage(event.error));
    };

    recognition.onend = () => {
      setIsListening(false);
      if (useLectureStore.getState().isRecording) {
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch {
            startRecognition();
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setTimeout(() => {
        try {
          recognition.start();
        } catch {
          setError("Failed to start speech recognition. Please refresh the page.");
        }
      }, 200);
    }
  }, [addSegment]);

  const start = useCallback(async () => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    setError(null);

    try {
      micStreamRef.current = await warmupMicrophone();
    } catch {
      setError(
        "Microphone access denied. Click the lock icon in your address bar and allow microphone access."
      );
      return;
    }

    startRecognition();
  }, [startRecognition]);

  useEffect(() => {
    if (isRecording) {
      start();
    } else {
      stopMic();
    }
    return () => stopMic();
  }, [isRecording, start, stopMic]);

  return { isSupported, error, isListening };
}
