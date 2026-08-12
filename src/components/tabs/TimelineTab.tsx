"use client";

import { useMemo } from "react";
import { useLectureStore } from "@/store/lectureStore";
import { buildTimelineFromSegments } from "@/lib/computed";

export default function TimelineTab() {
  const segments = useLectureStore((s) => s.segments);
  const recordingStartTime = useLectureStore((s) => s.recordingStartTime);
  const fullTranscript = useLectureStore((s) => s.fullTranscript);

  const timeline = useMemo(() => {
    if (!recordingStartTime || segments.length === 0) return [];
    return buildTimelineFromSegments(
      segments
        .filter((s) => s.isFinal)
        .map((s) => ({
          text: s.text,
          timestamp: s.timestamp,
          recordingStartTime,
        }))
    );
  }, [segments, recordingStartTime]);

  if (!fullTranscript) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-app-muted">
        <div className="mb-4 text-5xl">⏱️</div>
        <p>Record a lecture first — timeline is computed from transcript pauses</p>
        <p className="mt-1 text-xs">No AI call · deterministic code</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 rounded-xl bg-accent-soft px-4 py-2 text-xs text-brand-700 dark:text-brand-300">
        Code-computed from transcript timestamps and pause detection (≥8s gap = new topic)
      </div>

      {timeline.length > 0 ? (
        <div className="flex-1 space-y-0 overflow-y-auto rounded-2xl border border-app bg-app-card p-6">
          {timeline.map((segment, i) => (
            <div key={i} className="timeline-item relative pl-10 pb-8">
              <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-brand-700">
                {i + 1}
              </div>
              <div className="font-mono text-xs text-brand-600">
                {segment.startTime} – {segment.endTime}
              </div>
              <h3 className="mt-1 text-base font-semibold text-app">{segment.title}</h3>
              <p className="mt-1 text-sm text-app-muted">{segment.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-app-muted">
          <p>Not enough segments yet for timeline grouping</p>
        </div>
      )}
    </div>
  );
}
