/**
 * Normalize PostgreSQL URLs for Supabase + Prisma on serverless (Vercel).
 * Fixes: prepared statement "s0" already exists (42P05)
 */

function ensureSsl(url: string): string {
  if (!url || url.includes("sslmode=")) return url;
  return url.includes("?") ? `${url}&sslmode=require` : `${url}?sslmode=require`;
}

function addQueryParam(url: string, key: string, value: string): string {
  if (!url || url.includes(`${key}=`)) return url;
  return url.includes("?") ? `${url}&${key}=${value}` : `${url}?${key}=${value}`;
}

function stripQueryParams(url: string, keys: string[]): string {
  let result = url;
  for (const key of keys) {
    result = result
      .replace(new RegExp(`[?&]${key}=[^&]*`, "g"), "")
      .replace(/\?&/, "?")
      .replace(/\?$/, "");
  }
  return result;
}

function isPoolerUrl(url: string): boolean {
  return url.includes("pooler.supabase.com") || url.includes(":6543");
}

/** Runtime URL — transaction pooler with pgbouncer + connection_limit=1 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("postgres")) return url;

  let normalized = url;

  if (isPoolerUrl(normalized)) {
    normalized = addQueryParam(normalized, "pgbouncer", "true");
    normalized = addQueryParam(normalized, "connection_limit", "1");
  }

  return ensureSsl(normalized);
}

/** Direct/session URL — for DDL, migrations, and seed (no pgbouncer) */
export function getDirectUrl(): string {
  const direct = process.env.DIRECT_URL ?? "";
  if (direct.startsWith("postgres")) {
    return ensureSsl(stripQueryParams(direct, ["pgbouncer", "connection_limit"]));
  }

  const dbUrl = process.env.DATABASE_URL ?? "";
  if (!dbUrl.startsWith("postgres")) return dbUrl;

  const derived = stripQueryParams(
    dbUrl.replace(":6543/", ":5432/").replace(":6543?", ":5432?"),
    ["pgbouncer", "connection_limit"]
  );

  return ensureSsl(derived);
}

export function isPgBouncerPreparedStatementError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "42P05" ||
    (typeof e.message === "string" &&
      e.message.includes("prepared statement") &&
      e.message.includes("already exists"))
  );
}

export function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as { code?: string }).code === "P2021";
}
