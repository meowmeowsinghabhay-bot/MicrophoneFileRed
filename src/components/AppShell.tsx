"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
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
      <header className="sticky top-0 z-50 border-b border-app bg-app/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            {role && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-app">{displayName}</p>
                <p className="text-xs text-app-muted">
                  {role}
                  {readableId && ` · ${readableId}`}
                </p>
              </div>
            )}
            <ThemeToggle />
            {onLogout && (
              <button onClick={onLogout} className="btn-secondary px-3 py-1.5 text-xs">
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
