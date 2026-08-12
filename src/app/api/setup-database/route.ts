import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma, createDirectPrismaClient } from "@/lib/db";
import { handleRouteError } from "@/lib/handle-route";
import { isMissingTableError } from "@/lib/database-url";
import { repairAllStudentEnrollments } from "@/lib/ensure-enrollments";
import { runSeed } from "../../../../prisma/seed";

export const maxDuration = 60;

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
}

async function getDbCounts(db: ReturnType<typeof createDirectPrismaClient>) {
  try {
    const [users, courses, enrollments, lectures] = await Promise.all([
      db.user.count(),
      db.course.count(),
      db.enrollment.count(),
      db.lecture.count(),
    ]);
    return { users, courses, enrollments, lectures };
  } catch (err) {
    if (isMissingTableError(err)) {
      return { users: 0, courses: 0, enrollments: 0, lectures: 0 };
    }
    throw err;
  }
}

function isFullySeeded(counts: {
  users: number;
  courses: number;
  enrollments: number;
  lectures: number;
}) {
  return counts.users >= 5 && counts.courses >= 4 && counts.enrollments >= 4 && counts.lectures >= 1;
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

  const directDb = createDirectPrismaClient();

  try {
    let counts = await getDbCounts(directDb);

    if (isFullySeeded(counts)) {
      return NextResponse.json({
        ok: true,
        message: "Database already initialized.",
        ...counts,
        logins: ["student / student123", "teacher / teacher123"],
      });
    }

    if (counts.users > 0 && counts.courses > 0 && counts.enrollments === 0) {
      await repairAllStudentEnrollments(directDb);
      counts = await getDbCounts(directDb);
      if (isFullySeeded(counts)) {
        return NextResponse.json({
          ok: true,
          message: "Repaired missing enrollments (no data wipe).",
          ...counts,
          logins: ["student / student123", "teacher / teacher123"],
        });
      }
    }

    if (counts.users === 0 || counts.courses === 0) {
      const sqlPath = join(process.cwd(), "prisma", "supabase-init.sql");
      const sql = readFileSync(sqlPath, "utf8");
      const statements = splitSqlStatements(sql);

      for (const statement of statements) {
        try {
          await directDb.$executeRawUnsafe(statement);
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
    }

    if (counts.users === 0) {
      await runSeed(directDb);
    } else if (counts.enrollments === 0) {
      await repairAllStudentEnrollments(directDb);
    }

    counts = await getDbCounts(directDb);

    return NextResponse.json({
      ok: true,
      message: "Database initialized with demo data.",
      ...counts,
      logins: ["student / student123", "teacher / teacher123"],
      joinCode: "DSA26X",
    });
  } catch (error) {
    return handleRouteError(error, "Setup database");
  } finally {
    await directDb.$disconnect();
  }
}
