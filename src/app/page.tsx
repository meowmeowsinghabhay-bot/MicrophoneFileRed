import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-app edu-pattern">
      <header className="border-b border-app bg-app-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-display text-sm font-bold text-white">
              SC
            </div>
            <span className="font-display text-xl font-semibold text-app">{APP_NAME}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="text-center">
          <p className="mb-4 inline-block rounded-full bg-accent-soft px-4 py-1.5 text-sm font-medium text-brand-700 dark:text-brand-300">
            Classroom-first · Multilingual · Hybrid AI
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-app md:text-5xl">
            Every student understands
            <br />
            <span className="text-brand-600 dark:text-brand-400">every lecture</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-app-muted">
            Live captions, structured notes, quizzes, and revision — with code-computed timelines
            and keyword detection, plus AI only where understanding truly matters.
          </p>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { title: "Live Classroom", desc: "Real-time transcription + translation preserved as-is. Restyled, never rewritten." },
            { title: "Teacher Portal", desc: "Courses, join codes, content review, publish control, and real analytics." },
            { title: "Student Portal", desc: "Lecture viewer, bookmarks, catch-up, quiz, explain-back, and revision center." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-app bg-app-card p-6 shadow-card dark:shadow-card-dark">
              <h3 className="font-display text-lg font-semibold text-app">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-app-muted">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-20">
          <h2 className="text-center font-display text-2xl font-semibold text-app">Sign in to your portal</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Link
              href="/login/student"
              className="group rounded-2xl border-2 border-app bg-app-card p-8 shadow-card transition hover:border-brand-500 dark:shadow-card-dark"
            >
              <div className="mb-4 text-3xl">📚</div>
              <h3 className="font-display text-xl font-semibold text-app group-hover:text-brand-600">Student Login</h3>
              <p className="mt-2 text-sm text-app-muted">Join courses, watch lectures, study with AI tools.</p>
              <span className="mt-4 inline-block text-sm font-medium text-brand-600">student / student123 →</span>
            </Link>
            <Link
              href="/login/teacher"
              className="group rounded-2xl border-2 border-app bg-app-card p-8 shadow-card transition hover:border-brand-500 dark:shadow-card-dark"
            >
              <div className="mb-4 text-3xl">🎓</div>
              <h3 className="font-display text-xl font-semibold text-app group-hover:text-brand-600">Teacher Login</h3>
              <p className="mt-2 text-sm text-app-muted">Create courses, record lectures, review AI content.</p>
              <span className="mt-4 inline-block text-sm font-medium text-brand-600">teacher / teacher123 →</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
