import Link from "next/link";

const COLOR_MAP = {
  blue: {
    top: "bg-card-blue-light dark:bg-card-blue-dark",
    icon: "text-brand-600 dark:text-brand-400",
  },
  pink: {
    top: "bg-card-pink-light dark:bg-card-pink-dark",
    icon: "text-pink-600 dark:text-pink-400",
  },
  yellow: {
    top: "bg-card-yellow-light dark:bg-card-yellow-dark",
    icon: "text-amber-600 dark:text-amber-400",
  },
  purple: {
    top: "bg-card-purple-light dark:bg-card-purple-dark",
    icon: "text-purple-600 dark:text-purple-400",
  },
  green: {
    top: "bg-card-green-light dark:bg-card-green-dark",
    icon: "text-green-600 dark:text-green-400",
  },
} as const;

type CardColor = keyof typeof COLOR_MAP;

export default function ExploreCard({
  href,
  label,
  color,
  icon,
}: {
  href: string;
  label: string;
  color: CardColor;
  icon: React.ReactNode;
}) {
  const styles = COLOR_MAP[color];

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-app bg-app-card shadow-app transition hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className={`flex h-28 items-center justify-center ${styles.top}`}>
        <div className={`transition group-hover:scale-110 ${styles.icon}`}>{icon}</div>
      </div>
      <div className="border-t border-app px-4 py-4">
        <p className="text-sm font-bold text-app">{label}</p>
      </div>
    </Link>
  );
}
