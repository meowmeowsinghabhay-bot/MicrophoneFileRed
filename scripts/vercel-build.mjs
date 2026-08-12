#!/usr/bin/env node
/**
 * Fast Vercel build — does NOT connect to the database by default.
 * DB setup is done once locally: npm run db:push:supabase
 *
 * Optional: set RUN_DB_SETUP=true on Vercel to push+seed during build (90s timeout).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";

function run(command, env = process.env) {
  execSync(command, { stdio: "inherit", env });
}

function runWithTimeout(command, env, timeoutMs = 90000) {
  const result = spawnSync(command, {
    shell: true,
    stdio: "inherit",
    env,
    timeout: timeoutMs,
  });
  if (result.error?.code === "ETIMEDOUT") {
    throw new Error(`Timed out after ${timeoutMs / 1000}s`);
  }
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command}`);
  }
}

const dbUrl = process.env.DATABASE_URL ?? "";
const directUrl = process.env.DIRECT_URL ?? "";
const isVercel = process.env.VERCEL === "1";
const usePostgres =
  isVercel || dbUrl.startsWith("postgres") || directUrl.startsWith("postgres");
const runDbSetup = process.env.RUN_DB_SETUP === "true";

function getPushUrl() {
  return directUrl.startsWith("postgres") ? directUrl : dbUrl;
}

function ensureSsl(url) {
  if (!url || url.includes("sslmode=")) return url;
  return url.includes("?") ? `${url}&sslmode=require` : `${url}?sslmode=require`;
}

if (usePostgres) {
  console.log("[vercel-build] PostgreSQL mode (Prisma client only — no DB call during build)");
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

console.log("[vercel-build] Generating Prisma client…");
run("npx prisma generate");

if (runDbSetup && usePostgres) {
  const pushUrl = ensureSsl(getPushUrl());
  if (!pushUrl.startsWith("postgres")) {
    console.error("[vercel-build] RUN_DB_SETUP=true but no PostgreSQL URL found.");
    process.exit(1);
  }
  const pushEnv = {
    ...process.env,
    DATABASE_URL: pushUrl,
    ...(directUrl.startsWith("postgres")
      ? { DIRECT_URL: ensureSsl(directUrl) }
      : {}),
  };
  try {
    console.log("[vercel-build] RUN_DB_SETUP: pushing schema (90s max)…");
    runWithTimeout("npx prisma db push --accept-data-loss", pushEnv, 90000);
    console.log("[vercel-build] RUN_DB_SETUP: seeding (90s max)…");
    runWithTimeout("npx prisma db seed", pushEnv, 90000);
  } catch (err) {
    console.error("[vercel-build] DB setup failed:", err.message);
    console.error("Run locally instead: npm run db:push:supabase");
    process.exit(1);
  }
} else if (usePostgres) {
  console.log(
    "[vercel-build] Skipping db push/seed (fast build). Ensure tables exist — run npm run db:push:supabase locally once."
  );
}

console.log("[vercel-build] Building Next.js…");
run("npx next build");
console.log("[vercel-build] Done.");
