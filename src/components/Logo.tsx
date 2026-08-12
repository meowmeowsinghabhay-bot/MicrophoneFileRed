import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const MARK_WIDTH = 420;
const MARK_HEIGHT = 541;

const MARK_HEIGHT_PX = {
  md: 120,
  lg: 220,
  xl: 320,
} as const;

function BrandIcon({ size = 36 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-icon.png"
      alt=""
      width={240}
      height={240}
      aria-hidden
      className="block shrink-0 object-contain"
      style={{ height: size, width: "auto" }}
    />
  );
}

function BrandMark({
  size,
  priority = false,
}: {
  size: keyof typeof MARK_HEIGHT_PX;
  priority?: boolean;
}) {
  const height = MARK_HEIGHT_PX[size];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt={`${APP_NAME} — Multilingual AI Classroom Assistant`}
      width={MARK_WIDTH}
      height={MARK_HEIGHT}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className="block max-w-none object-contain"
      style={{ height, width: "auto" }}
    />
  );
}

export default function Logo({
  href = "/",
  size = "sm",
  linked = true,
  priority = false,
}: {
  href?: string;
  size?: "sm" | keyof typeof MARK_HEIGHT_PX;
  linked?: boolean;
  priority?: boolean;
}) {
  const content =
    size === "sm" ? (
      <span className="inline-flex items-center gap-2.5">
        <BrandIcon size={38} />
        <span className="leading-none">
          <span className="block text-base font-bold tracking-tight text-app">
            Intelli<span className="text-brand-600">Shala</span>
          </span>
          <span className="mt-0.5 block text-[10px] font-medium text-app-muted">
            Understand. Learn. Achieve.
          </span>
        </span>
      </span>
    ) : (
      <BrandMark size={size} priority={priority || size === "xl"} />
    );

  if (!linked) {
    return <span className="inline-flex shrink-0 items-center">{content}</span>;
  }

  return (
    <Link href={href} className="inline-flex shrink-0 items-center transition hover:opacity-90">
      {content}
    </Link>
  );
}
