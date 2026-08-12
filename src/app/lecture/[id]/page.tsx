"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useAuthStore } from "@/store/authStore";
import AppShell from "@/components/AppShell";
import { LECTURE_VIEWER_TABS, ViewerTabId } from "@/lib/constants";
import { buildTimelineFromSegments, searchInLecture, filterSegmentsAfter } from "@/lib/computed";
import ExplainBackTab from "@/components/tabs/ExplainBackTab";
import ChatTab from "@/components/tabs/ChatTab";
import ExamTab from "@/components/tabs/ExamTab";

interface LectureData {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  isDemo: boolean;
  segments: { id: string; text: string; translatedText: string | null; startMs: number; endMs: number; isImportant: boolean }[];
  contentBlocks: { id: string; type: string; content: string; status: string }[];
  course: { name: string; teacher: { displayName: string } };
}

export default function LectureViewerPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [lecture, setLecture] = useState<LectureData | null>(null);
  const [tab, setTab] = useState<ViewerTabId>("transcript");
  const [searchQuery, setSearchQuery] = useState("");
  const [catchUpFrom, setCatchUpFrom] = useState("0:00");
  const [showTranslated, setShowTranslated] = useState(true);

  useEffect(() => {
    if (!user) { router.replace("/"); return; }
    fetch(`/api/lectures/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.lecture) setLecture(d.lecture);
      });
  }, [params.id, user, router]);

  if (!user || !lecture) {
    return <div className="flex min-h-screen items-center justify-center bg-app text-app-muted">Loading lecture…</div>;
  }

  if (!lecture.published && user.role === "student") {
    return (
      <AppShell role="Student" displayName={user.displayName} readableId={user.readableId}>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-app-muted">This lecture is not published yet.</p>
          <Link href="/student/dashboard" className="mt-4 inline-block text-brand-600">← Back to dashboard</Link>
        </div>
      </AppShell>
    );
  }

  const notes = lecture.contentBlocks.find((b) => b.type === "notes");
  const mindmap = lecture.contentBlocks.find((b) => b.type === "mindmap");
  const revision = lecture.contentBlocks.find((b) => b.type === "revision");

  const timeline = buildTimelineFromSegments(
    lecture.segments.map((s) => ({
      text: s.text,
      timestamp: s.startMs,
      recordingStartTime: 0,
    }))
  );

  const searchResults = searchInLecture(searchQuery, [
    ...lecture.segments.map((s) => ({ text: s.text, source: "transcript", timestampMs: s.startMs })),
    ...(notes ? [{ text: notes.content, source: "notes" }] : []),
  ]);

  const catchUpMs = parseCatchUpMs(catchUpFrom);
  const catchUpSegments = filterSegmentsAfter(
    lecture.segments.map((s) => ({ text: s.text, timestamp: s.startMs, recordingStartTime: 0 })),
    catchUpMs
  );

  return (
    <AppShell
      role={user.role === "teacher" ? "Teacher" : "Student"}
      displayName={user.displayName}
      readableId={user.readableId}
      onLogout={() => { useAuthStore.getState().logout(); router.push("/"); }}
    >
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
        {/* Timeline sidebar — code-computed, no LLM */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-app bg-app-card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-app-muted">Timeline</h3>
            <p className="mb-3 text-xs text-app-muted">Computed from transcript pauses</p>
            <div className="space-y-3">
              {timeline.map((block, i) => (
                <button
                  key={i}
                  onClick={() => setCatchUpFrom(block.startTime)}
                  className="block w-full text-left"
                >
                  <p className="font-mono text-xs text-brand-600">{block.startTime}–{block.endTime}</p>
                  <p className="text-xs text-app">{block.title}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <Link href={user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} className="text-sm text-app-muted hover:text-brand-600">
              ← Dashboard
            </Link>
            <h1 className="mt-2 font-display text-2xl font-bold text-app">{lecture.title}</h1>
            <p className="text-sm text-app-muted">{lecture.course.name} · {lecture.course.teacher.displayName}</p>
            {lecture.isDemo && (
              <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700 dark:bg-amber-900/30">Demo Data</span>
            )}
          </div>

          {/* Search — code-computed FTS-style */}
          <div className="mb-4">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lecture…"
              className="w-full rounded-xl border border-app bg-app-card px-4 py-2 text-sm text-app"
            />
            {searchQuery && (
              <div className="mt-2 rounded-xl border border-app bg-app-secondary p-3 text-sm">
                {searchResults.length === 0 ? (
                  <p className="text-app-muted">No matches</p>
                ) : (
                  searchResults.slice(0, 5).map((r, i) => (
                    <p key={i} className="text-app"><span className="text-xs text-brand-600">[{r.source}]</span> {r.text.slice(0, 100)}…</p>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mb-4 flex flex-wrap gap-2 border-b border-app pb-2">
            {LECTURE_VIEWER_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm ${tab === t.id ? "bg-accent-soft font-medium text-brand-700" : "text-app-muted"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-app bg-app-card p-6 shadow-card dark:shadow-card-dark">
            {tab === "transcript" && (
              <div>
                <div className="mb-4 flex gap-2">
                  <button onClick={() => setShowTranslated(false)} className={`rounded-lg px-3 py-1 text-xs ${!showTranslated ? "bg-accent-soft" : "border border-app"}`}>Original</button>
                  <button onClick={() => setShowTranslated(true)} className={`rounded-lg px-3 py-1 text-xs ${showTranslated ? "bg-accent-soft" : "border border-app"}`}>Bilingual</button>
                </div>
                <div className="space-y-3">
                  {lecture.segments.map((s) => (
                    <div key={s.id} className="border-b border-app pb-2">
                      <span className="font-mono text-xs text-app-muted">{formatMs(s.startMs)}</span>
                      {s.isImportant && <span className="ml-2 text-xs text-amber-600">⭐ Code-detected</span>}
                      <p className="text-app">{s.text}</p>
                      {showTranslated && s.translatedText && (
                        <p className="text-brand-600 dark:text-brand-400">{s.translatedText}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "notes" && notes && (
              <div>
                <span className="mb-3 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-xs text-brand-700">{notes.status}</span>
                <div className="prose prose-sm prose-edu max-w-none dark:prose-invert">
                  <ReactMarkdown>{notes.content}</ReactMarkdown>
                </div>
              </div>
            )}

            {tab === "formulas" && (
              <p className="text-app-muted">Formulas extracted from board captures appear here after AI vision processing.</p>
            )}

            {tab === "mindmap" && mindmap && (
              <pre className="whitespace-pre-wrap text-sm text-app">{mindmap.content}</pre>
            )}

            {tab === "quiz" && <ExamTab />}
            {tab === "explain" && <ExplainBackTab />}
            {tab === "chat" && <ChatTab />}

            {tab === "catchup" && (
              <div>
                <p className="mb-3 text-sm text-app-muted">What did I miss? — pure timestamp filter, no AI</p>
                <input
                  value={catchUpFrom}
                  onChange={(e) => setCatchUpFrom(e.target.value)}
                  placeholder="From time (e.g. 0:30)"
                  className="mb-4 rounded-lg border border-app bg-app-secondary px-3 py-2 text-sm"
                />
                <div className="space-y-2">
                  {catchUpSegments.map((s, i) => (
                    <p key={i} className="text-sm text-app">{s.text}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function parseCatchUpMs(time: string): number {
  const [m, s] = time.split(":").map(Number);
  return ((m || 0) * 60 + (s || 0)) * 1000;
}
