#!/usr/bin/env node
import { execSync } from "node:child_process";

if (process.env.VERCEL === "1") {
  console.log("[postinstall] Skipping prisma generate on Vercel (vercel-build handles it).");
  process.exit(0);
}

execSync("npx prisma generate", { stdio: "inherit" });
