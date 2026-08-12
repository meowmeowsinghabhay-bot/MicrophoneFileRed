"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import AppShell from "@/components/AppShell";

export default function TeacherDashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [courses, setCourses] = useState<{ id: string; name: string; code: string; joinCode: string; _count: { lectures: number; enrollments: number } }[]>([]);
  const [stats, setStats] = useState({ courseCount: 0, lectureCount: 0, activeStudents: 0, avgQuizScore: 0 });
  const [roster, setRoster] = useState<{ readableId: string; displayName: string; lecturesCompleted: number; avgQuizScore: number }[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: "", code: "", semester: "Spring 2026", description: "" });

  useEffect(() => {
    if (!user || user.role !== "teacher") {
      router.replace("/login/teacher");
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!user) return;
    const [coursesRes, analyticsRes] = await Promise.all([
      fetch(`/api/courses?teacherId=${user.id}`),
      fetch(`/api/analytics/teacher?teacherId=${user.id}`),
    ]);
    const coursesData = await coursesRes.json();
    const analyticsData = await analyticsRes.json();
    setCourses(coursesData.courses || []);
    setStats(analyticsData.stats || stats);
    setRoster(analyticsData.roster || []);
  };

  const createCourse = async () => {
    if (!user || !newCourse.name) return;
    await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newCourse, teacherId: user.id }),
    });
    setShowCreate(false);
    setNewCourse({ name: "", code: "", semester: "Spring 2026", description: "" });
    loadData();
  };

  if (!user) return null;

  return (
    <AppShell
      role="Teacher"
      displayName={user.displayName}
      readableId={user.readableId}
      onLogout={() => { logout(); router.push("/"); }}
    >
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-app">Teacher Dashboard</h1>
            <p className="text-app-muted">Manage courses and review AI-generated content</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(true)} className="btn-secondary">
              + New Course
            </button>
            <Link href="/session/live" className="btn-primary">
              🎙️ Record Lecture
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Courses", value: stats.courseCount },
            { label: "Lectures", value: stats.lectureCount },
            { label: "Students", value: stats.activeStudents },
            { label: "Avg Quiz Score", value: `${stats.avgQuizScore}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-app bg-app-card p-5 shadow-app">
              <p className="text-sm text-app-muted">{s.label}</p>
              <p className="text-2xl font-bold text-app">{s.value}</p>
            </div>
          ))}
        </div>

        {showCreate && (
          <div className="mb-8 rounded-2xl border border-app bg-app-card p-6">
            <h2 className="font-semibold text-app">Create Course</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input placeholder="Course name" value={newCourse.name} onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })} className="rounded-lg border border-app bg-app-secondary px-3 py-2 text-app" />
              <input placeholder="Course code" value={newCourse.code} onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })} className="rounded-lg border border-app bg-app-secondary px-3 py-2 text-app" />
              <input placeholder="Semester" value={newCourse.semester} onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })} className="rounded-lg border border-app bg-app-secondary px-3 py-2 text-app" />
              <input placeholder="Description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} className="rounded-lg border border-app bg-app-secondary px-3 py-2 text-app" />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={createCourse} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">Create</button>
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-app px-4 py-2 text-sm text-app-muted">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-semibold text-app">Your Courses</h2>
            <div className="space-y-3">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/teacher/courses/${c.id}`}
                  className="block rounded-xl border border-app bg-app-card p-4 transition hover:border-brand-500"
                >
                  <p className="font-medium text-app">{c.name}</p>
                  <p className="text-xs text-app-muted">
                    {c.code} · Join: <strong>{c.joinCode}</strong> · {c._count.lectures} lectures · {c._count.enrollments} students
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-app">Student Roster</h2>
            <div className="rounded-2xl border border-app bg-app-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-app-secondary text-left text-app-muted">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Done</th>
                    <th className="px-4 py-2">Quiz</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s) => (
                    <tr key={s.readableId} className="border-t border-app">
                      <td className="px-4 py-2 font-mono text-xs">{s.readableId}</td>
                      <td className="px-4 py-2 text-app">{s.displayName}</td>
                      <td className="px-4 py-2">{s.lecturesCompleted}</td>
                      <td className="px-4 py-2">{s.avgQuizScore}%</td>
                    </tr>
                  ))}
                  {roster.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-4 text-app-muted">No students enrolled yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
