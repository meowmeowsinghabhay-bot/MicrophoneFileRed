"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LIVE_TABS, TabId } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import CourseSelector from "@/components/CourseSelector";
import ControlPanel from "@/components/ControlPanel";
import LanguageSelector from "@/components/LanguageSelector";
import LiveCaptions from "@/components/LiveCaptions";
import NotesTab from "@/components/tabs/NotesTab";
import MindmapTab from "@/components/tabs/MindmapTab";
import TimelineTab from "@/components/tabs/TimelineTab";
import ImportantTab from "@/components/tabs/ImportantTab";
import ExamTab from "@/components/tabs/ExamTab";
import RevisionTab from "@/components/tabs/RevisionTab";
import ExplainBackTab from "@/components/tabs/ExplainBackTab";
import ChatTab from "@/components/tabs/ChatTab";
import BoardTab from "@/components/tabs/BoardTab";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import SaveLectureButton from "@/components/SaveLectureButton";
import GenerateAllButton from "@/components/GenerateAllButton";

const TAB_COMPONENTS: Record<TabId, React.ComponentType> = {
  live: LiveCaptions,
  notes: NotesTab,
  mindmap: MindmapTab,
  timeline: TimelineTab,
  important: ImportantTab,
  exam: ExamTab,
  revision: RevisionTab,
  explain: ExplainBackTab,
  chat: ChatTab,
  board: BoardTab,
};

const STUDENT_TABS: TabId[] = ["live", "notes", "mindmap", "timeline", "important", "exam", "revision", "explain", "chat"];
const TEACHER_TABS: TabId[] = [...STUDENT_TABS, "board"];

export default function LiveSessionPage() {
  const [activeTab, setActiveTab] = useState<TabId>("live");
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  if (!user) return null;

  const visibleTabs = LIVE_TABS.filter((t) =>
    user.role === "teacher" ? TEACHER_TABS.includes(t.id) : STUDENT_TABS.includes(t.id)
  );
  const ActiveComponent = TAB_COMPONENTS[activeTab];
  const backHref = user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-app">
      <header className="sticky top-0 z-50 border-b border-app bg-app/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-4">
            <Logo href={backHref} />
            <span className="hidden text-xs text-app-muted sm:inline">
              Live · {user.displayName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user.role === "teacher" && <CourseSelector />}
            <LanguageSelector />
            <ControlPanel />
            <SaveLectureButton />
            {user.role === "teacher" && <GenerateAllButton />}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <nav className="hidden w-56 shrink-0 border-r border-app py-6 md:block">
          <ul className="space-y-1 px-3">
            {visibleTabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    activeTab === tab.id
                      ? "bg-accent-soft font-semibold text-brand-600 dark:text-brand-400"
                      : "text-app-muted hover:bg-app-secondary hover:text-app"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-4 md:p-8" style={{ minHeight: "calc(100vh - 73px)" }}>
          <div className="mb-4 md:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabId)}
              className="input-field"
            >
              {visibleTabs.map((t) => (
                <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
