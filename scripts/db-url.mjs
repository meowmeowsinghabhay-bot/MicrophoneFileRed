/**
 * Shared PostgreSQL URL normalization for Supabase + Prisma (build scripts).
 * Keep in sync with src/lib/database-url.ts
 */

export function ensureSsl(url) {
  if (!url || url.includes("sslmode=")) return url;
  return url.includes("?") ? `${url}&sslmode=require` : `${url}?sslmode=require`;
}

export function addQueryParam(url, key, value) {
  if (!url || url.includes(`${key}=`)) return url;
  return url.includes("?") ? `${url}&${key}=${value}` : `${url}?${key}=${value}`;
}

export function stripQueryParams(url, keys) {
  let result = url;
  for (const key of keys) {
    result = result
      .replace(new RegExp(`[?&]${key}=[^&]*`, "g"), "")
      .replace(/\?&/, "?")
      .replace(/\?$/, "");
  }
  return result;
}

export function isPoolerUrl(url) {
  return url.includes("pooler.supabase.com") || url.includes(":6543");
}

export function normalizeDatabaseUrl(url) {
  if (!url?.startsWith("postgres")) return url ?? "";

  let normalized = url;

  if (isPoolerUrl(normalized)) {
    normalized = addQueryParam(normalized, "pgbouncer", "true");
    normalized = addQueryParam(normalized, "connection_limit", "1");
  }

  normalized = ensureSsl(normalized);
  return normalized;
}

export function normalizeDirectUrl(url) {
  if (!url?.startsWith("postgres")) return url ?? "";
  let normalized = stripQueryParams(url, ["pgbouncer", "connection_limit"]);
  normalized = ensureSsl(normalized);
  return normalized;
}

/** Session pooler (5432) derived from transaction pooler (6543) when DIRECT_URL is unset. */
export function deriveDirectUrl(databaseUrl) {
  if (!databaseUrl?.startsWith("postgres")) return "";

  let derived = databaseUrl
    .replace(":6543/", ":5432/")
    .replace(":6543?", ":5432?");

  derived = stripQueryParams(derived, ["pgbouncer", "connection_limit"]);
  return ensureSsl(derived);
}

export function getRuntimeDatabaseUrl(env = process.env) {
  return normalizeDatabaseUrl(env.DATABASE_URL ?? "");
}

export function getMigrationDatabaseUrl(env = process.env) {
  const direct = env.DIRECT_URL ?? "";
  if (direct.startsWith("postgres")) return normalizeDirectUrl(direct);
  return deriveDirectUrl(env.DATABASE_URL ?? "") || normalizeDatabaseUrl(env.DATABASE_URL ?? "");
}

export function validateVercelDatabaseEnv(env = process.env) {
  const warnings = [];
  const dbUrl = env.DATABASE_URL ?? "";

  if (!dbUrl.startsWith("postgres")) {
    warnings.push("DATABASE_URL is not PostgreSQL — production APIs will fail.");
    return warnings;
  }

  if (dbUrl.includes("db.") && dbUrl.includes(".supabase.co") && !dbUrl.includes("pooler")) {
    warnings.push(
      "DATABASE_URL uses direct Supabase host (db.*.supabase.co). Use pooler.supabase.com on Vercel."
    );
  }

  if (isPoolerUrl(dbUrl) && !dbUrl.includes("pgbouncer=true")) {
    warnings.push("DATABASE_URL pooler URL should include pgbouncer=true (auto-added at runtime).");
  }

  if (!env.DIRECT_URL?.startsWith("postgres")) {
    warnings.push(
      "DIRECT_URL not set — migrations/setup will derive session pooler from DATABASE_URL."
    );
  }

  return warnings;
}
