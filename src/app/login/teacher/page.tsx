"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

export default function TeacherLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(username, password, "teacher");
    setLoading(false);
    if (ok) router.push("/teacher/dashboard");
    else setError("Invalid credentials. Use teacher / teacher123");
  };

  return (
    <div className="flex min-h-screen flex-col bg-app">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Logo size="md" />
          <ThemeToggle />
        </div>

        <div className="card-padded">
          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-card-blue-light dark:bg-card-blue-dark">
              <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-app">Teacher Login</h1>
            <p className="mt-1 text-sm text-app-muted">Manage courses and review AI content</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="input-field" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-field" />
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-app-muted">
            Demo: <strong>teacher</strong> / <strong>teacher123</strong>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-app-muted">
          <Link href="/" className="hover:text-brand-600">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
