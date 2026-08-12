import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { joinCode, studentId } = await request.json();
    const course = await prisma.course.findUnique({ where: { joinCode: joinCode?.toUpperCase() } });
    if (!course) {
      return NextResponse.json({ error: "Invalid join code" }, { status: 404 });
    }

    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId, courseId: course.id } },
      create: { studentId, courseId: course.id },
      update: {},
    });

    return NextResponse.json({ course });
  } catch (error) {
    return NextResponse.json({ error: "Failed to join course" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          lectures: { where: { published: true }, orderBy: { createdAt: "desc" } },
          teacher: { select: { displayName: true } },
        },
      },
    },
  });

  return NextResponse.json({
    courses: enrollments.map((e) => e.course),
  });
}
