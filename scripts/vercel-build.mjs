#!/usr/bin/env node
/**
 * Vercel production build:
 * - Swaps Prisma provider sqlite → postgresql (in build env only; git stays sqlite)
 * - Pushes schema + seeds demo data when DATABASE_URL is PostgreSQL
 * - Runs next build
 *
 * Local `npm run build` is unchanged and keeps using SQLite.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit", env: process.env });
}

const isVercel = process.env.VERCEL === "1";
const dbUrl = process.env.DATABASE_URL ?? "";
const usePostgres = isVercel || dbUrl.startsWith("postgres");

if (usePostgres) {
  console.log("[vercel-build] Using PostgreSQL for Prisma");
  const schemaPath = "prisma/schema.prisma";
  const schema = readFileSync(schemaPath, "utf8");
  const postgresSchema = schema.replace(
    /provider\s*=\s*"sqlite"/,
    'provider = "postgresql"'
  );
  writeFileSync(schemaPath, postgresSchema);
}

run("npx prisma generate");

if (usePostgres) {
  if (!dbUrl.startsWith("postgres")) {
    console.error(
      "[vercel-build] ERROR: Set DATABASE_URL to a PostgreSQL connection string in Vercel env vars."
    );
    process.exit(1);
  }
  console.log("[vercel-build] Applying schema to database…");
  run("npx prisma db push --accept-data-loss");
  console.log("[vercel-build] Seeding demo data…");
  run("npx prisma db seed");
}

console.log("[vercel-build] Building Next.js app…");
run("npx next build");
