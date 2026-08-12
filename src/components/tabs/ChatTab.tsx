"use client";

import { useState, useRef, useEffect } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { usePreferencesStore } from "@/store/preferencesStore";

export default function ChatTab() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);
  const structuredNotes = useLectureStore((s) => s.structuredNotes);
  const chatMessages = useLectureStore((s) => s.chatMessages);
  const addChatMessage = useLectureStore((s) => s.addChatMessage);
  const learningLevel = usePreferencesStore((s) => s.learningLevel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");

    addChatMessage({
      id: `${Date.now()}-user`,
      role: "user",
      content: question,
      timestamp: Date.now(),
    });

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          transcript: fullTranscript,
          notes: structuredNotes,
          learningLevel,
        }),
      });
      const data = await res.json();
      addChatMessage({
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: data.answer || "Sorry, I couldn't answer that.",
        timestamp: Date.now(),
      });
    } catch {
      addChatMessage({
        id: `${Date.now()}-error`,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!fullTranscript) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-app-muted">
        <div className="mb-4 text-5xl">🤖</div>
        <p>Record a lecture first to ask questions about it</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 text-xs text-app-muted">
        Answers are grounded in this lecture&apos;s transcript and notes only.
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-app bg-app-card p-4">
        {chatMessages.length === 0 && (
          <p className="text-center text-sm text-app-muted">
            Ask anything about the lecture content
          </p>
        )}
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-app-secondary text-app"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-app-secondary px-4 py-2.5 text-sm text-app-muted">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about the lecture..."
          className="flex-1 rounded-lg border border-app px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
