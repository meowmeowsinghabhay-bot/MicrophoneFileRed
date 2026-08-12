#!/usr/bin/env node
/**
 * Push schema + seed to Supabase from your machine (when Vercel build can't reach DB).
 *
 * Usage (PowerShell):
 *   $env:DIRECT_URL="postgresql://postgres.xxx:PASSWORD@aws-0-xxx.pooler.supabase.com:5432/postgres"
 *   npm run db:push:supabase
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL || "";

if (!url.startsWith("postgres")) {
  console.error("Set DIRECT_URL or DATABASE_URL to your Supabase PostgreSQL URI.");
  console.error("Use Session pooler from Supabase → Connect (pooler.supabase.com:5432).");
  process.exit(1);
}

const withSsl = url.includes("sslmode=") ? url : `${url}${url.includes("?") ? "&" : "?"}sslmode=require`;

const schemaPath = "prisma/schema.prisma";
const original = readFileSync(schemaPath, "utf8");
const postgres = original.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
writeFileSync(schemaPath, postgres);

const env = { ...process.env, DATABASE_URL: withSsl };

try {
  execSync("npx prisma generate", { stdio: "inherit", env });
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", env });
  execSync("npx prisma db seed", { stdio: "inherit", env });
  console.log("\n✅ Supabase is ready. Set SKIP_DB_PUSH=true on Vercel and redeploy.\n");
} finally {
  writeFileSync(schemaPath, original);
}
