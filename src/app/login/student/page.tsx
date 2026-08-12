"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

function StudentLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [setupUrl, setSetupUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/student/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSetupUrl("");
    setLoading(true);
    const result = await login(username, password, "student");
    setLoading(false);
    if (result.success) {
      router.push(returnTo);
      return;
    }
    setError(result.error || "Invalid credentials. Use student / student123");
    if (result.setupUrl) setSetupUrl(result.setupUrl);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="input-field" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-field" />
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
        {setupUrl && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            Database not initialized.{" "}
            <a href={setupUrl} className="font-medium underline" target="_blank" rel="noreferrer">
              Run one-time setup
            </a>
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-app-muted">
        Demo: <strong>student</strong> / <strong>student123</strong>
      </p>
    </>
  );
}

export default function StudentLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-app">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Logo size="md" />
          <ThemeToggle />
        </div>
        <div className="card-padded">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-app">Student Login</h1>
            <p className="mt-1 text-sm text-app-muted">Access your courses and lectures</p>
          </div>
          <Suspense fallback={<p className="text-sm text-app-muted">Loading…</p>}>
            <StudentLoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-app-muted">
          <Link href="/" className="hover:text-brand-600">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
