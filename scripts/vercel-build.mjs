#!/usr/bin/env node
/**
 * Vercel production build (Supabase-compatible):
 * - Swaps Prisma to postgresql in the build environment only
 * - Uses DIRECT_URL for db push/seed when set (recommended for Supabase)
 * - Falls back to DATABASE_URL
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

function run(command, env = process.env) {
  execSync(command, { stdio: "inherit", env });
}

const isVercel = process.env.VERCEL === "1";
const dbUrl = process.env.DATABASE_URL ?? "";
const directUrl = process.env.DIRECT_URL ?? "";
const usePostgres = isVercel || dbUrl.startsWith("postgres") || directUrl.startsWith("postgres");
const skipDbPush = process.env.SKIP_DB_PUSH === "true";

/** Connection used for prisma db push + seed (needs reachable host from Vercel). */
function getPushUrl() {
  return directUrl.startsWith("postgres") ? directUrl : dbUrl;
}

function ensureSsl(url) {
  if (!url || url.includes("sslmode=")) return url;
  return url.includes("?") ? `${url}&sslmode=require` : `${url}?sslmode=require`;
}

if (usePostgres) {
  console.log("[vercel-build] Using PostgreSQL for Prisma");
  const schemaPath = "prisma/schema.prisma";
  const schema = readFileSync(schemaPath, "utf8");
  let postgresSchema = schema.replace(
    /provider\s*=\s*"sqlite"/,
    'provider = "postgresql"'
  );

  if (directUrl.startsWith("postgres")) {
    postgresSchema = postgresSchema.replace(
      /url\s+=\s+env\("DATABASE_URL"\)/,
      'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")'
    );
  }

  writeFileSync(schemaPath, postgresSchema);
}

run("npx prisma generate");

if (usePostgres) {
  const pushUrl = ensureSsl(getPushUrl());

  if (!pushUrl.startsWith("postgres")) {
    console.error("[vercel-build] ERROR: Set DATABASE_URL (and ideally DIRECT_URL) in Vercel.");
    console.error("");
    console.error("Supabase fix for P1001:");
    console.error("  1. Open Supabase → Connect");
    console.error("  2. Session pooler (port 5432, *.pooler.supabase.com) → DIRECT_URL");
    console.error("  3. Transaction pooler (port 6543) → DATABASE_URL");
    console.error("  Do NOT use db.xxx.supabase.co:5432 on Vercel — it often fails (IPv6).");
    process.exit(1);
  }

  const pushEnv = {
    ...process.env,
    DATABASE_URL: pushUrl,
    ...(directUrl.startsWith("postgres") ? { DIRECT_URL: ensureSsl(directUrl) } : {}),
  };

  if (!skipDbPush) {
    console.log("[vercel-build] Applying schema to database…");
    try {
      run("npx prisma db push --accept-data-loss", pushEnv);
    } catch {
      console.error("");
      console.error("[vercel-build] db push failed. Use Supabase Session pooler as DIRECT_URL.");
      console.error("Or push once locally: npm run db:push:supabase");
      console.error("Then set SKIP_DB_PUSH=true on Vercel and redeploy.");
      process.exit(1);
    }
  } else {
    console.log("[vercel-build] SKIP_DB_PUSH=true — skipping schema push");
  }

  console.log("[vercel-build] Seeding demo data…");
  run("npx prisma db seed", pushEnv);
}

console.log("[vercel-build] Building Next.js app…");
run("npx next build");
