import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import ExploreCard from "@/components/ExploreCard";
import HeroVisual from "@/components/HeroVisual";
import { APP_TAGLINE } from "@/lib/constants";
const FEATURES = [
  {
    href: "/session/live",
    label: "Live Captions",
    color: "blue" as const,
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    href: "/login/student",
    label: "Notes & Revision",
    color: "green" as const,
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    href: "/session/live",
    label: "Mindmap",
    color: "purple" as const,
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    href: "/session/live",
    label: "Board Vision",
    color: "yellow" as const,
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
  },
  {
    href: "/session/live",
    label: "Ask AI",
    color: "pink" as const,
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-app">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-12 py-16 md:grid-cols-2 md:gap-16 md:py-24">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-600">
              Multilingual AI Classroom
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-app md:text-[2.75rem] md:leading-[1.12]">
              Free and open
              <br />
              <span className="text-brand-600">classroom education</span>
              <br />
              in your language.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-app-muted">
              IntelliShala transforms live lectures into translated captions, structured notes,
              mindmaps, and revision material — so every student understands, regardless of language.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login/student" className="btn-primary">
                Get started
              </Link>
              <Link href="/session/live" className="btn-secondary">
                Try live session
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <HeroVisual />
          </div>
        </section>

        <section className="pb-20">          <h2 className="section-title">Explore IntelliShala</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {FEATURES.map((f) => (
              <ExploreCard key={f.label} {...f} />
            ))}
          </div>
        </section>

        <section className="border-t border-app pb-24 pt-16">
          <h2 className="section-title">Sign in to your portal</h2>
          <p className="mt-2 text-app-muted">Choose your role to access the classroom platform.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Link
              href="/login/student"
              className="card-padded group transition hover:border-brand-400 hover:shadow-card-hover"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-card-green-light dark:bg-card-green-dark">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-app group-hover:text-brand-600">Student Login</h3>
              <p className="mt-2 text-sm leading-relaxed text-app-muted">
                Join courses, watch lectures, study with AI tools.
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-brand-600">
                student / student123 →
              </span>
            </Link>

            <Link
              href="/login/teacher"
              className="card-padded group transition hover:border-brand-400 hover:shadow-card-hover"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-card-blue-light dark:bg-card-blue-dark">
                <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-app group-hover:text-brand-600">Teacher Login</h3>
              <p className="mt-2 text-sm leading-relaxed text-app-muted">
                Create courses, record lectures, review AI content.
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-brand-600">
                teacher / teacher123 →
              </span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-app py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-app-muted">
          {APP_TAGLINE}
        </div>
      </footer>
    </div>
  );
}
