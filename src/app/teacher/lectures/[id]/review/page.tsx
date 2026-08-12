"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useAuthStore } from "@/store/authStore";
import AppShell from "@/components/AppShell";

export default function ContentReviewPage() {
  const params = useParams();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [blocks, setBlocks] = useState<{ id: string; type: string; content: string; status: string }[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!user || user.role !== "teacher") router.replace("/login/teacher");
    fetch(`/api/lectures/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.lecture) {
          setBlocks(d.lecture.contentBlocks || []);
          setTitle(d.lecture.title);
        }
      });
  }, [params.id, user, router]);

  const updateBlock = async (blockId: string, content: string, status: string) => {
    await fetch(`/api/lectures/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentBlock: { blockId, content, status } }),
    });
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, content, status } : b)));
  };

  if (!user) return null;

  return (
    <AppShell role="Teacher" displayName={user.displayName} readableId={user.readableId} onLogout={() => { useAuthStore.getState().logout(); router.push("/"); }}>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/teacher/dashboard" className="text-sm text-app-muted hover:text-brand-600">← Dashboard</Link>
        <h1 className="mt-4 text-2xl font-bold text-app">Review: {title}</h1>
        <p className="text-sm text-app-muted">Edit AI content and set approval status</p>

        <div className="mt-8 space-y-6">
          {blocks.map((block) => (
            <div key={block.id} className="rounded-2xl border border-app bg-app-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium capitalize text-app">{block.type}</span>
                <select
                  value={block.status}
                  onChange={(e) => updateBlock(block.id, block.content, e.target.value)}
                  className="rounded-lg border border-app bg-app-secondary px-2 py-1 text-xs"
                >
                  <option>AI Generated</option>
                  <option>Teacher Edited</option>
                  <option>Teacher Approved</option>
                </select>
              </div>
              <textarea
                value={block.content}
                onChange={(e) => setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, content: e.target.value } : b)))}
                rows={8}
                className="w-full rounded-lg border border-app bg-app-secondary p-3 font-mono text-sm text-app"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => updateBlock(block.id, block.content, "Teacher Edited")}
                  className="rounded-lg border border-app px-3 py-1.5 text-sm text-app"
                >
                  Save Edit
                </button>
                <button
                  onClick={() => updateBlock(block.id, block.content, "Teacher Approved")}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white"
                >
                  Approve
                </button>
              </div>
              <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{block.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
