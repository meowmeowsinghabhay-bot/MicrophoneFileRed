"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppShell({
  children,
  role,
  displayName,
  readableId,
  onLogout,
}: {
  children: React.ReactNode;
  role?: string;
  displayName?: string;
  readableId?: string;
  onLogout?: () => void;
}) {
  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-50 border-b border-app bg-app-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 font-display text-sm font-bold text-white">
              SC
            </div>
            <div>
              <p className="font-display text-base font-semibold text-app">{APP_NAME}</p>
              {role && (
                <p className="text-xs text-app-muted">
                  {role} · {displayName} {readableId && `(${readableId})`}
                </p>
              )}
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {onLogout && (
              <button
                onClick={onLogout}
                className="rounded-lg border border-app px-3 py-1.5 text-sm text-app-muted hover:text-red-500"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
