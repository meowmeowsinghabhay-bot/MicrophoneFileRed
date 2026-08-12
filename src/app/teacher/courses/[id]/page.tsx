"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import AppShell from "@/components/AppShell";

export default function TeacherCoursePage() {
  const params = useParams();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [lectures, setLectures] = useState<{ id: string; title: string; published: boolean; isDemo: boolean }[]>([]);

  useEffect(() => {
    if (!user || user.role !== "teacher") router.replace("/login/teacher");
    fetch(`/api/lectures?courseId=${params.id}`)
      .then((r) => r.json())
      .then((d) => setLectures(d.lectures || []));
  }, [params.id, user, router]);

  if (!user) return null;

  const togglePublish = async (id: string, published: boolean) => {
    await fetch(`/api/lectures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setLectures((prev) => prev.map((l) => (l.id === id ? { ...l, published: !published } : l)));
  };

  return (
    <AppShell role="Teacher" displayName={user.displayName} readableId={user.readableId} onLogout={() => { useAuthStore.getState().logout(); router.push("/"); }}>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/teacher/dashboard" className="text-sm text-app-muted hover:text-brand-600">← Dashboard</Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-app">Course Lectures</h1>
        <div className="mt-6 space-y-3">
          {lectures.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-xl border border-app bg-app-card p-4">
              <div>
                <p className="font-medium text-app">{l.title}</p>
                <p className="text-xs text-app-muted">{l.published ? "Published" : "Draft"}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/teacher/lectures/${l.id}/review`} className="rounded-lg border border-app px-3 py-1.5 text-sm text-app">Review</Link>
                <button onClick={() => togglePublish(l.id, l.published)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white">
                  {l.published ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
