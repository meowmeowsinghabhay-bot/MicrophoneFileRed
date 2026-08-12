"use client";

import { useEffect, useRef, useState } from "react";
import { useLectureStore } from "@/store/lectureStore";

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

    let markmap: { destroy: () => void } | null = null;

    async function render() {
      const { Transformer } = await import("markmap-lib");
      const { Markmap } = await import("markmap-view");

      const transformer = new Transformer();
      const { root } = transformer.transform(mindmapMarkdown);

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.width = "100%";
        svg.style.height = "100%";
        containerRef.current.appendChild(svg);
        markmap = Markmap.create(svg, { autoFit: true }, root);
      }
    }

    render();
    return () => {
      markmap?.destroy();
    };
  }, [mindmapMarkdown]);

  if (!fullTranscript) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-slate-400">
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
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Mindmap"}
          </button>
        </div>
      )}

      {mindmapMarkdown ? (
        <div
          ref={containerRef}
          className="markmap-container flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white"
          style={{ minHeight: "400px" }}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          <p>Click &quot;Generate Mindmap&quot; to visualize lecture topics</p>
        </div>
      )}
    </div>
  );
}
