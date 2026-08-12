#!/usr/bin/env node
/**
 * Fast Vercel build — does NOT connect to the database by default.
 * DB setup: /api/setup-database?secret=… or npm run db:push:supabase locally.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";
import {
  getMigrationDatabaseUrl,
  getRuntimeDatabaseUrl,
  normalizeDirectUrl,
  validateVercelDatabaseEnv,
} from "./db-url.mjs";

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

const isVercel = process.env.VERCEL === "1";
const rawDbUrl = process.env.DATABASE_URL ?? "";
const rawDirectUrl = process.env.DIRECT_URL ?? "";
const usePostgres = rawDbUrl.startsWith("postgres") || rawDirectUrl.startsWith("postgres");
const runDbSetup = process.env.RUN_DB_SETUP === "true";

if (isVercel && !usePostgres) {
  console.error("[vercel-build] DATABASE_URL must be a PostgreSQL Supabase pooler URL on Vercel.");
  process.exit(1);
}

if (usePostgres) {
  process.env.DATABASE_URL = getRuntimeDatabaseUrl();
  const migrationUrl = getMigrationDatabaseUrl();
  if (migrationUrl.startsWith("postgres")) {
    process.env.DIRECT_URL = migrationUrl;
  }
}

if (isVercel && usePostgres) {
  for (const warning of validateVercelDatabaseEnv()) {
    console.warn(`[vercel-build] ⚠ ${warning}`);
  }
}

const schemaPath = "prisma/schema.prisma";
const originalSchema = readFileSync(schemaPath, "utf8");

try {
  if (usePostgres) {
    console.log("[vercel-build] PostgreSQL mode (Prisma client only — no DB call during build)");
    let postgresSchema = originalSchema.replace(
      /provider\s*=\s*"sqlite"/,
      'provider = "postgresql"'
    );

    if (getMigrationDatabaseUrl().startsWith("postgres")) {
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
    const pushUrl = getMigrationDatabaseUrl();
    if (!pushUrl.startsWith("postgres")) {
      console.error("[vercel-build] RUN_DB_SETUP=true but no PostgreSQL URL found.");
      process.exit(1);
    }
    const pushEnv = {
      ...process.env,
      DATABASE_URL: normalizeDirectUrl(pushUrl),
      DIRECT_URL: normalizeDirectUrl(pushUrl),
    };
    try {
      console.log("[vercel-build] RUN_DB_SETUP: pushing schema (90s max)…");
      runWithTimeout("npx prisma db push --accept-data-loss", pushEnv, 90000);
      console.log("[vercel-build] RUN_DB_SETUP: seeding (90s max)…");
      runWithTimeout("npx prisma db seed", pushEnv, 90000);
    } catch (err) {
      console.error("[vercel-build] DB setup failed:", err.message);
      process.exit(1);
    }
  } else if (usePostgres) {
    console.log(
      "[vercel-build] Skipping db push/seed. Initialize once via /api/setup-database?secret=…"
    );
  }

  console.log("[vercel-build] Building Next.js…");
  run("npx next build");
  console.log("[vercel-build] Done.");
} finally {
  if (usePostgres) {
    writeFileSync(schemaPath, originalSchema);
  }
}
