import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDatabaseUrl } from "@/lib/database-url";
import { handleRouteError } from "@/lib/handle-route";

export async function GET() {
  try {
    const [users, courses, enrollments, lectures] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.lecture.count(),
    ]);
    return NextResponse.json({
      ok: true,
      db: "connected",
      users,
      courses,
      enrollments,
      lectures,
      pooler: getDatabaseUrl().includes("pgbouncer=true"),
    });
  } catch (error) {
    return handleRouteError(error, "Health check");
  }
}
