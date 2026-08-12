"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import { APP_NAME } from "@/lib/constants";

export default function StudentLoginPage() {
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
    const ok = await login(username, password, "student");
    setLoading(false);
    if (ok) router.push("/student/dashboard");
    else setError("Invalid credentials. Use student / student123");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app edu-pattern px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-sm text-app-muted hover:text-brand-600">← {APP_NAME}</Link>
          <ThemeToggle />
        </div>
        <div className="rounded-2xl border border-app bg-app-card p-8 shadow-card dark:shadow-card-dark">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-xl dark:bg-brand-900/40">📚</div>
            <h1 className="font-display text-2xl font-bold text-app">Student Login</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="student" className="w-full rounded-lg border border-app bg-app-secondary px-4 py-2.5 text-app" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-app bg-app-secondary px-4 py-2.5 text-app" />
            {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/20">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-app-muted">Demo: student / student123</p>
        </div>
      </div>
    </div>
  );
}
