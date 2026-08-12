import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/db";
import { runSeed } from "../../../../prisma/seed";

export const maxDuration = 60;

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expected = process.env.SETUP_SECRET || "intellishala-setup-2026";

  if (!secret || secret !== expected) {
    return NextResponse.json(
      { error: "Unauthorized. Pass ?secret=YOUR_SETUP_SECRET" },
      { status: 401 }
    );
  }

  if (!process.env.DATABASE_URL?.startsWith("postgres")) {
    return NextResponse.json(
      { error: "DATABASE_URL must be a PostgreSQL connection string on Vercel." },
      { status: 500 }
    );
  }

  try {
    const existing = await prisma.user.count();
    if (existing > 0) {
      return NextResponse.json({
        ok: true,
        message: "Database already initialized.",
        users: existing,
        logins: ["student / student123", "teacher / teacher123"],
      });
    }
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code !== "P2021") {
      console.error("Setup check error:", err);
      return NextResponse.json({ error: "Database check failed" }, { status: 500 });
    }
  }

  try {
    const sqlPath = join(process.cwd(), "prisma", "supabase-init.sql");
    const sql = readFileSync(sqlPath, "utf8");
    const statements = splitSqlStatements(sql);

    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes("already exists") ||
          msg.includes("duplicate") ||
          msg.includes("42710")
        ) {
          continue;
        }
        throw err;
      }
    }

    await runSeed();

    const users = await prisma.user.count();
    const lectures = await prisma.lecture.count();

    return NextResponse.json({
      ok: true,
      message: "Database initialized with demo data.",
      users,
      lectures,
      logins: ["student / student123", "teacher / teacher123"],
      joinCode: "DSA26X",
    });
  } catch (error) {
    console.error("Setup database error:", error);
    return NextResponse.json(
      {
        error: "Setup failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
