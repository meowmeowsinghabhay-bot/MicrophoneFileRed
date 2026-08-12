import { IMPORTANT_KEYWORDS } from "./constants";

export interface TimelineBlock {
  startTime: string;
  endTime: string;
  startMs: number;
  endMs: number;
  title: string;
  description: string;
  segmentCount: number;
}

export interface SegmentInput {
  text: string;
  timestamp: number;
  recordingStartTime: number;
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Code-computed timeline from transcript segments + pause heuristic (no LLM). */
export function buildTimelineFromSegments(
  segments: SegmentInput[],
  pauseThresholdMs = 8000
): TimelineBlock[] {
  const finals = segments
    .filter((s) => s.text.trim())
    .sort((a, b) => a.timestamp - b.timestamp);

  if (finals.length === 0) return [];

  const blocks: SegmentInput[][] = [];
  let current: SegmentInput[] = [finals[0]];

  for (let i = 1; i < finals.length; i++) {
    const gap = finals[i].timestamp - finals[i - 1].timestamp;
    if (gap >= pauseThresholdMs) {
      blocks.push(current);
      current = [finals[i]];
    } else {
      current.push(finals[i]);
    }
  }
  blocks.push(current);

  return blocks.map((block, idx) => {
    const startMs = block[0].timestamp - block[0].recordingStartTime;
    const endMs = block[block.length - 1].timestamp - block[0].recordingStartTime + 2000;
    const text = block.map((s) => s.text).join(" ");
    const words = text.split(/\s+/).slice(0, 6).join(" ");
    return {
      startTime: formatMs(Math.max(0, startMs)),
      endTime: formatMs(Math.max(0, endMs)),
      startMs: Math.max(0, startMs),
      endMs: Math.max(0, endMs),
      title: `Topic ${idx + 1}: ${words}${text.split(/\s+/).length > 6 ? "…" : ""}`,
      description: text.slice(0, 120) + (text.length > 120 ? "…" : ""),
      segmentCount: block.length,
    };
  });
}

/** Live keyword detection — zero API cost. */
export function detectImportantKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return IMPORTANT_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Filter segments after a timestamp (catch-up / what did I miss). */
export function filterSegmentsAfter(
  segments: { text: string; timestamp: number; recordingStartTime: number }[],
  afterMs: number
) {
  return segments.filter(
    (s) => s.timestamp - s.recordingStartTime >= afterMs
  );
}

/** Simple in-lecture search — no embeddings. */
export function searchInLecture(
  query: string,
  corpus: { text: string; source: string; timestampMs?: number }[]
) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return corpus.filter((item) => item.text.toLowerCase().includes(q));
}
