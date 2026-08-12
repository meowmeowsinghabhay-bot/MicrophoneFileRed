"use client";

import { useEffect, useRef, useState } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { renderMarkmapInContainer } from "@/lib/markmap-render";

export default function MindmapTab() {
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);
  const structuredNotes = useLectureStore((s) => s.structuredNotes);
  const mindmapMarkdown = useLectureStore((s) => s.mindmapMarkdown);
  const setMindmapMarkdown = useLectureStore((s) => s.setMindmapMarkdown);

  const generateMindmap = async () => {
    if (!fullTranscript) return;
    setLoading(true);
    try {
      const res = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: fullTranscript, notes: structuredNotes }),
      });
      const data = await res.json();
      if (data.markdown) setMindmapMarkdown(data.markdown);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mindmapMarkdown || !containerRef.current) return;

    let instance: { destroy: () => void } | null = null;
    let cancelled = false;

    renderMarkmapInContainer(containerRef.current, mindmapMarkdown).then((result) => {
      if (cancelled) {
        result.destroy();
        return;
      }
      instance = result;
    });

    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [mindmapMarkdown]);

  if (!fullTranscript) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-app-muted">
        <div className="mb-4 text-5xl">🧠</div>
        <p>Record a lecture first to generate a mindmap</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {!mindmapMarkdown && (
        <div className="mb-4">
          <button
            onClick={generateMindmap}
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Mindmap"}
          </button>
        </div>
      )}

      {mindmapMarkdown ? (
        <div
          ref={containerRef}
          className="markmap-container flex-1 overflow-hidden rounded-xl border border-app bg-app-card"
          style={{ minHeight: "400px" }}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-app-muted">
          <p>Click &quot;Generate Mindmap&quot; to visualize lecture topics</p>
        </div>
      )}
    </div>
  );
}
