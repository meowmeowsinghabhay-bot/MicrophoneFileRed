import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/session/live", label: "Live" },
  { href: "/login/student", label: "Student" },
  { href: "/login/teacher", label: "Teacher" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-app bg-app/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Logo size="sm" />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login/student" className="hidden text-sm font-medium text-brand-600 sm:inline">
            Sign in →
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
