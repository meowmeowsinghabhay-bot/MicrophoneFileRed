"use client";

import { useEffect, useRef } from "react";

export default function MindmapViewer({ markdown }: { markdown: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!markdown || !containerRef.current) return;
    let markmap: { destroy: () => void } | null = null;

    async function render() {
      const { Transformer } = await import("markmap-lib");
      const { Markmap } = await import("markmap-view");
      const transformer = new Transformer();
      const { root } = transformer.transform(markdown);
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
    return () => markmap?.destroy();
  }, [markdown]);

  return (
    <div
      ref={containerRef}
      className="min-h-[400px] w-full rounded-xl border border-app bg-app-secondary"
    />
  );
}
