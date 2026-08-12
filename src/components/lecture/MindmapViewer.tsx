"use client";

import { useEffect, useRef } from "react";
import { renderMarkmapInContainer } from "@/lib/markmap-render";

export default function MindmapViewer({ markdown }: { markdown: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!markdown || !containerRef.current) return;

    let instance: { destroy: () => void } | null = null;
    let cancelled = false;

    renderMarkmapInContainer(containerRef.current, markdown).then((result) => {
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
  }, [markdown]);

  return (
    <div
      ref={containerRef}
      className="markmap-container min-h-[400px] w-full rounded-xl border border-app bg-app-secondary"
    />
  );
}
