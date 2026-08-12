"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useAuthStore } from "@/store/authStore";
import AppShell from "@/components/AppShell";
import { LECTURE_VIEWER_TABS, ViewerTabId } from "@/lib/constants";
import { buildTimelineFromSegments, searchInLecture, filterSegmentsAfter } from "@/lib/computed";
import ExplainBackTab from "@/components/tabs/ExplainBackTab";
import ChatTab from "@/components/tabs/ChatTab";
import LectureHydrator from "@/components/lecture/LectureHydrator";
import MindmapViewer from "@/components/lecture/MindmapViewer";
import QuizViewer from "@/components/lecture/QuizViewer";

interface LectureData {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  isDemo: boolean;
  durationMs: number | null;
  segments: { id: string; text: string; translatedText: string | null; startMs: number; endMs: number; isImportant: boolean; isManualFlag: boolean }[];
  contentBlocks: { id: string; type: string; content: string; status: string }[];
  course: { name: string; teacher: { displayName: string } };
}

interface Bookmark {
  id: string;
  label: string;
  timestampMs: number | null;
}

function block(lecture: LectureData, type: string) {
  return lecture.contentBlocks.find((b) => b.type === type);
}

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export default function LectureViewerPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [lecture, setLecture] = useState<LectureData | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tab, setTab] = useState<ViewerTabId>("transcript");
  const [searchQuery, setSearchQuery] = useState("");
  const [catchUpFrom, setCatchUpFrom] = useState("0:00");
  const [showTranslated, setShowTranslated] = useState(true);
  const [bookmarkLabel, setBookmarkLabel] = useState("");
  const [bookmarkMsg, setBookmarkMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.replace("/"); return; }
    Promise.all([
      fetch(`/api/lectures/${params.id}`).then((r) => r.json()),
      user.role === "student"
        ? fetch(`/api/lectures/${params.id}/bookmarks?studentId=${user.id}`).then((r) => r.json())
        : Promise.resolve({ bookmarks: [] }),
    ]).then(([lecData, bmData]) => {
      if (lecData.lecture) setLecture(lecData.lecture);
      setBookmarks(bmData.bookmarks || []);
    });
  }, [params.id, user, router]);

  useEffect(() => {
    if (!user || user.role !== "student" || user.id === "demo" || !lecture) return;

    fetch(`/api/lectures/${params.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: user.id,
        lastPositionMs: 0,
        completed: false,
      }),
    }).catch(() => {
      /* non-blocking */
    });
  }, [user, lecture, params.id]);

  const addBookmark = async () => {
    if (!user || user.role !== "student" || user.id === "demo" || !bookmarkLabel.trim()) return;
    setBookmarkMsg(null);
    try {
      const res = await fetch(`/api/lectures/${params.id}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.id,
          label: bookmarkLabel.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add bookmark");
      setBookmarks((prev) => [data.bookmark, ...prev]);
      setBookmarkLabel("");
      setBookmarkMsg("Bookmark saved");
    } catch (err) {
      setBookmarkMsg(err instanceof Error ? err.message : "Could not save bookmark");
    }
  };

  const markComplete = async () => {
    if (!user || user.role !== "student" || user.id === "demo" || !lecture) return;
    await fetch(`/api/lectures/${params.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: user.id,
        lastPositionMs: lecture.durationMs || 0,
        completed: true,
      }),
    });
    setBookmarkMsg("Marked as complete");
  };

  if (!user || !lecture) {
    return <div className="flex min-h-screen items-center justify-center bg-app text-app-muted">Loading lecture…</div>;
  }

  if (!lecture.published && user.role === "student") {
    return (
      <AppShell role="Student" displayName={user.displayName} readableId={user.readableId}>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-app-muted">This lecture is not published yet.</p>
          <Link href="/student/dashboard" className="mt-4 inline-block text-brand-600">← Back</Link>
        </div>
      </AppShell>
    );
  }

  const notes = block(lecture, "notes");
  const simplified = block(lecture, "simplified");
  const mindmap = block(lecture, "mindmap");
  const revision = block(lecture, "revision");
  const formulas = block(lecture, "formulas");
  const concepts = block(lecture, "concepts");
  const board = block(lecture, "board");
  const summary = block(lecture, "summary");
  const quizBlock = block(lecture, "quiz");
  const importantBlock = block(lecture, "important");

  const quizQuestions = parseJson(quizBlock?.content, []);
  const importantLines = parseJson<string[]>(importantBlock?.content, []);
  const fullTranscript = lecture.segments.map((s) => s.text).join(" ");

  const timeline = buildTimelineFromSegments(
    lecture.segments.map((s) => ({ text: s.text, timestamp: s.startMs, recordingStartTime: 0 }))
  );

  const searchResults = searchInLecture(searchQuery, [
    ...lecture.segments.map((s) => ({ text: s.text, source: "transcript", timestampMs: s.startMs })),
    ...(notes ? [{ text: notes.content, source: "notes" }] : []),
    ...(concepts ? [{ text: concepts.content, source: "concepts" }] : []),
  ]);

  const catchUpSegments = filterSegmentsAfter(
    lecture.segments.map((s) => ({ text: s.text, timestamp: s.startMs, recordingStartTime: 0 })),
    parseCatchUpMs(catchUpFrom)
  );

  const importantFromSegments = lecture.segments.filter((s) => s.isImportant);

  return (
    <AppShell
      role={user.role === "teacher" ? "Teacher" : "Student"}
      displayName={user.displayName}
      readableId={user.readableId}
      onLogout={() => { useAuthStore.getState().logout(); router.push("/"); }}
    >
      <LectureHydrator
        fullTranscript={fullTranscript}
        segments={lecture.segments}
        notes={notes?.content || ""}
        mindmap={mindmap?.content || ""}
        revision={revision?.content || ""}
        examQuestions={quizQuestions}
        importantLines={importantLines}
      />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-app bg-app-card p-4">
              <h3 className="text-xs font-semibold uppercase text-app-muted">Timeline</h3>
              <p className="mb-3 text-xs text-app-muted">Code-computed from pauses</p>
              <div className="space-y-2">
                {timeline.map((block, i) => (
                  <button key={i} onClick={() => { setCatchUpFrom(block.startTime); setTab("catchup"); }} className="block w-full text-left hover:text-brand-600">
                    <p className="font-mono text-xs text-brand-600">{block.startTime}–{block.endTime}</p>
                    <p className="text-xs text-app">{block.title}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-app bg-app-card p-4">
              <h3 className="text-xs font-semibold uppercase text-app-muted">Quick Stats</h3>
              <p className="mt-2 text-sm text-app">{lecture.segments.length} segments</p>
              <p className="text-sm text-app">{lecture.contentBlocks.length} content blocks</p>
              <p className="text-sm text-app">{importantFromSegments.length} important moments</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <Link href={user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} className="text-sm text-app-muted hover:text-brand-600">← Dashboard</Link>
          <h1 className="mt-2 text-2xl font-bold text-app">{lecture.title}</h1>
          <p className="text-sm text-app-muted">{lecture.course.name} · {lecture.course.teacher.displayName}</p>
          {lecture.description && <p className="mt-1 text-sm text-app-muted">{lecture.description}</p>}
          {lecture.isDemo && <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700 dark:bg-amber-900/30">Demo Data</span>}
          {user.role === "student" && user.id !== "demo" && (
            <button
              type="button"
              onClick={markComplete}
              className="ml-2 mt-2 rounded-lg border border-app px-3 py-1 text-xs text-app-muted hover:text-brand-600"
            >
              Mark complete
            </button>
          )}
          {bookmarkMsg && <p className="mt-1 text-xs text-app-muted">{bookmarkMsg}</p>}

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript, notes, concepts…"
            className="mt-4 w-full rounded-xl border border-app bg-app-card px-4 py-2 text-sm"
          />
          {searchQuery && searchResults.length > 0 && (
            <div className="mt-2 rounded-xl border border-app bg-app-secondary p-3 text-sm">
              {searchResults.slice(0, 6).map((r, i) => (
                <p key={i} className="text-app"><span className="text-brand-600">[{r.source}]</span> {r.text.slice(0, 120)}…</p>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-1 border-b border-app pb-2">
            {LECTURE_VIEWER_TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-lg px-2.5 py-1.5 text-xs md:text-sm ${tab === t.id ? "bg-accent-soft font-medium text-brand-700" : "text-app-muted hover:text-app"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-app bg-app-card p-6 shadow-app">
            {tab === "transcript" && (
              <>
                <div className="mb-4 flex gap-2">
                  <button onClick={() => setShowTranslated(false)} className={`rounded-lg px-3 py-1 text-xs ${!showTranslated ? "bg-accent-soft" : "border border-app"}`}>Original</button>
                  <button onClick={() => setShowTranslated(true)} className={`rounded-lg px-3 py-1 text-xs ${showTranslated ? "bg-accent-soft" : "border border-app"}`}>Bilingual</button>
                </div>
                <div className="max-h-[500px] space-y-3 overflow-y-auto">
                  {lecture.segments.map((s) => (
                    <div key={s.id} className="border-b border-app pb-2">
                      <span className="font-mono text-xs text-app-muted">{formatMs(s.startMs)}</span>
                      {s.isImportant && <span className="ml-2 rounded bg-amber-100 px-1.5 text-xs text-amber-700 dark:bg-amber-900/30">⭐ {s.isManualFlag ? "Teacher flagged" : "Code-detected"}</span>}
                      <p className="text-app">{s.text}</p>
                      {showTranslated && s.translatedText && <p className="text-brand-600 dark:text-brand-400">{s.translatedText}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "notes" && notes && <MarkdownBlock content={notes.content} status={notes.status} />}
            {tab === "simplified" && simplified && <MarkdownBlock content={simplified.content} status={simplified.status} />}
            {tab === "formulas" && formulas && <MarkdownBlock content={formulas.content} status={formulas.status} math />}
            {tab === "concepts" && concepts && <MarkdownBlock content={concepts.content} status={concepts.status} />}
            {tab === "board" && board && <MarkdownBlock content={board.content} status={board.status} />}
            {tab === "revision" && revision && <MarkdownBlock content={revision.content} status={revision.status} />}
            {tab === "mindmap" && mindmap && <MindmapViewer markdown={mindmap.content} />}

            {tab === "important" && (
              <div className="space-y-3">
                <p className="text-xs text-app-muted">Live code-detected + AI deep scan results</p>
                {importantFromSegments.map((s) => (
                  <div key={s.id} className="rounded-xl border border-amber-200/50 bg-amber-50 p-3 dark:border-amber-800/30 dark:bg-amber-900/10">
                    <span className="text-xs text-brand-600">{formatMs(s.startMs)} · Code-detected</span>
                    <p className="text-sm text-app">{s.text}</p>
                  </div>
                ))}
                {importantLines.map((line, i) => (
                  <div key={i} className="rounded-xl border border-app bg-app-secondary p-3">
                    <span className="text-xs text-purple-600">AI-assisted</span>
                    <p className="text-sm text-app">{line}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "quiz" && (
              <QuizViewer
                questions={quizQuestions}
                lectureId={lecture.id}
                studentId={user.role === "student" ? user.id : undefined}
              />
            )}
            {tab === "explain" && <ExplainBackTab />}
            {tab === "chat" && <ChatTab />}

            {tab === "catchup" && (
              <div>
                <p className="mb-3 text-sm text-app-muted">Filter by timestamp — no AI needed</p>
                <input value={catchUpFrom} onChange={(e) => setCatchUpFrom(e.target.value)} className="mb-4 rounded-lg border border-app bg-app-secondary px-3 py-2 text-sm" placeholder="0:00" />
                {summary && <div className="mb-4 rounded-xl bg-accent-soft p-4"><MarkdownBlock content={summary.content} /></div>}
                <div className="space-y-2">
                  {catchUpSegments.map((s, i) => <p key={i} className="text-sm text-app">{s.text}</p>)}
                </div>
              </div>
            )}

            {tab === "bookmarks" && (
              <div className="space-y-4">
                {user.role === "student" && user.id !== "demo" && (
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={bookmarkLabel}
                      onChange={(e) => setBookmarkLabel(e.target.value)}
                      placeholder="Add a bookmark label…"
                      className="flex-1 rounded-lg border border-app bg-app-secondary px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addBookmark}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Add bookmark
                    </button>
                  </div>
                )}
                {bookmarks.length === 0 ? (
                  <p className="text-app-muted">No bookmarks yet for this lecture.</p>
                ) : (
                  bookmarks.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-xl bg-app-secondary px-4 py-3">
                      <span className="text-sm text-app">🔖 {b.label}</span>
                      {b.timestampMs != null && (
                        <span className="font-mono text-xs text-brand-600">{formatMs(b.timestampMs)}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MarkdownBlock({ content, status, math }: { content: string; status?: string; math?: boolean }) {
  return (
    <div>
      {status && <span className="mb-3 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-xs text-brand-700">{status}</span>}
      <div className="prose prose-sm prose-edu max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={math ? [remarkMath] : []} rehypePlugins={math ? [rehypeKatex] : []}>{content}</ReactMarkdown>
      </div>
    </div>
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
