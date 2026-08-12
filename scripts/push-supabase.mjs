#!/usr/bin/env node
/**
 * Push schema + seed to Supabase from your machine.
 *
 * Usage (PowerShell):
 *   $env:DIRECT_URL="postgresql://postgres.xxx:PASSWORD@aws-0-xxx.pooler.supabase.com:5432/postgres"
 *   npm run db:push:supabase
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import {
  getMigrationDatabaseUrl,
  getRuntimeDatabaseUrl,
  normalizeDirectUrl,
} from "./db-url.mjs";

const migrationUrl = getMigrationDatabaseUrl();

if (!migrationUrl.startsWith("postgres")) {
  console.error("Set DIRECT_URL or DATABASE_URL to your Supabase PostgreSQL URI.");
  console.error("Use Session pooler from Supabase → Connect (pooler.supabase.com:5432).");
  process.exit(1);
}

const schemaPath = "prisma/schema.prisma";
const original = readFileSync(schemaPath, "utf8");
const postgres = original
  .replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"')
  .replace(
    /url\s+=\s+env\("DATABASE_URL"\)/,
    'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")'
  );
writeFileSync(schemaPath, postgres);

const directUrl = normalizeDirectUrl(migrationUrl);
const runtimeUrl = getRuntimeDatabaseUrl() || directUrl;
const env = {
  ...process.env,
  DATABASE_URL: directUrl,
  DIRECT_URL: directUrl,
};

try {
  execSync("npx prisma generate", { stdio: "inherit", env });
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", env });
  execSync("npx prisma db seed", { stdio: "inherit", env });
  console.log("\n✅ Supabase is ready.");
  console.log("Set on Vercel:");
  console.log(`  DATABASE_URL = ${runtimeUrl.replace(/:[^:@/]+@/, ":****@")}`);
  console.log(`  DIRECT_URL   = ${directUrl.replace(/:[^:@/]+@/, ":****@")}`);
  console.log("\nThen redeploy. Run setup URL once if tables were not created:\n");
  console.log("  /api/setup-database?secret=intellishala-setup-2026\n");
} finally {
  writeFileSync(schemaPath, original);
}
