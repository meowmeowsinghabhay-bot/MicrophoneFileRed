"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import AppShell from "@/components/AppShell";

interface Course {
  id: string;
  name: string;
  code: string;
  joinCode: string;
  lectures: { id: string; title: string; isDemo: boolean }[];
  teacher: { displayName: string };
}

interface DashboardStats {
  lecturesCompleted: number;
  lecturesInProgress: number;
  avgQuizScore: number;
  totalBookmarks: number;
}

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [continueLearning, setContinueLearning] = useState<{ lectureId: string; title: string; course: string; progressPct: number } | null>(null);
  const [recentProgress, setRecentProgress] = useState<{ lectureId: string; title: string; course: string; completed: boolean; progressPct: number }[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoadError("");
    const [coursesRes, statsRes] = await Promise.all([
      fetch(`/api/courses/join?studentId=${user.id}`),
      fetch(`/api/students/${user.id}/dashboard`),
    ]);
    const coursesData = await coursesRes.json();
    const statsData = await statsRes.json();
    if (!coursesRes.ok || !statsRes.ok) {
      const setupUrl = coursesData.setupUrl || statsData.setupUrl;
      setLoadError(
        setupUrl
          ? "Database not initialized. Ask your admin to run the setup URL once."
          : coursesData.error || statsData.error || "Failed to load dashboard"
      );
      setLoading(false);
      return;
    }
    setCourses(coursesData.courses || []);
    setStats(statsData.stats);
    setContinueLearning(statsData.continueLearning);
    setRecentProgress(statsData.recentProgress || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.replace("/login/student");
      return;
    }
    load();
  }, [user, router]);

  const handleJoin = async () => {
    if (!user || !joinCode.trim()) return;
    setJoinError("");
    const res = await fetch("/api/courses/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode: joinCode.trim(), studentId: user.id }),
    });
    if (!res.ok) {
      const data = await res.json();
      setJoinError(data.error || "Invalid code");
      return;
    }
    setJoinCode("");
    load();
  };

  if (!user) return null;

  const totalLectures = courses.reduce((a, c) => a + (c.lectures?.length || 0), 0);

  return (
    <AppShell role="Student" displayName={user.displayName} readableId={user.readableId} onLogout={() => { logout(); router.push("/"); }}>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-app">My Learning</h1>
            <p className="text-app-muted">{courses.length} courses · {totalLectures} lectures available</p>
          </div>
          <Link href="/session/live" className="btn-primary">
            🎙️ Join Live Session
          </Link>
        </div>

        {loadError && (
          <div className="mb-8 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            {loadError}
          </div>
        )}

        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Completed", value: stats.lecturesCompleted },
              { label: "In Progress", value: stats.lecturesInProgress },
              { label: "Avg Quiz Score", value: `${stats.avgQuizScore}%` },
              { label: "Bookmarks", value: stats.totalBookmarks },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-app bg-app-card p-5 shadow-app">
                <p className="text-sm text-app-muted">{s.label}</p>
                <p className="text-2xl font-bold text-app">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {continueLearning && (
          <div className="mb-8 rounded-2xl border-2 border-brand-500/30 bg-accent-soft/30 p-6">
            <h2 className="font-semibold text-app">Continue Learning</h2>
            <p className="text-sm text-app-muted">{continueLearning.course}</p>
            <p className="mt-1 font-medium text-app">{continueLearning.title}</p>
            <div className="mt-3 h-2 rounded-full bg-app-secondary">
              <div className="h-2 rounded-full bg-brand-600" style={{ width: `${continueLearning.progressPct}%` }} />
            </div>
            <Link href={`/lecture/${continueLearning.lectureId}`} className="mt-3 inline-block text-sm font-medium text-brand-600">
              Resume ({continueLearning.progressPct}%) →
            </Link>
          </div>
        )}

        {recentProgress.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 font-semibold text-app">Recent Activity</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {recentProgress.map((p) => (
                <Link key={p.lectureId} href={`/lecture/${p.lectureId}`} className="rounded-xl border border-app bg-app-card p-4 hover:border-brand-500">
                  <p className="text-sm font-medium text-app">{p.title}</p>
                  <p className="text-xs text-app-muted">{p.course} · {p.completed ? "✓ Done" : `${p.progressPct}%`}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-app bg-app-card p-6 shadow-app">
          <h2 className="font-semibold text-app">Join a Course</h2>
          <div className="mt-3 flex gap-2">
            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Join code" className="flex-1 rounded-lg border border-app bg-app-secondary px-4 py-2 text-app" />
            <button onClick={handleJoin} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">Join</button>
          </div>
          {joinError && <p className="mt-2 text-sm text-red-500">{joinError}</p>}
          <p className="mt-2 text-xs text-app-muted">Codes: <strong>DSA26X</strong> · <strong>DBMS42</strong> · <strong>NET7K9</strong> · <strong>OS88P1</strong></p>
        </div>

        {loading ? (
          <p className="text-app-muted">Loading…</p>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.id} className="rounded-2xl border border-app bg-app-card p-6 shadow-app">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-app">{course.name}</h3>
                    <p className="text-sm text-app-muted">{course.code} · {course.teacher?.displayName}</p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-brand-700">{course.lectures?.length || 0} lectures</span>
                </div>
                <div className="mt-4 space-y-2">
                  {course.lectures?.map((lec) => (
                    <Link key={lec.id} href={`/lecture/${lec.id}`} className="flex items-center justify-between rounded-xl bg-app-secondary px-4 py-3 transition hover:bg-accent-soft">
                      <span className="text-sm font-medium text-app">
                        {lec.title}
                        {lec.isDemo && <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30">Demo</span>}
                      </span>
                      <span className="text-xs text-brand-600">Open →</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
