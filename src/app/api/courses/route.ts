import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateJoinCode } from "@/lib/terminology";

export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get("teacherId");
  if (!teacherId) {
    return NextResponse.json({ error: "teacherId required" }, { status: 400 });
  }

  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: {
      _count: { select: { lectures: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ courses });
}

export async function POST(request: NextRequest) {
  try {
    const { name, code, semester, description, teacherId } = await request.json();
    if (!name || !teacherId) {
      return NextResponse.json({ error: "name and teacherId required" }, { status: 400 });
    }

    let joinCode = generateJoinCode();
    while (await prisma.course.findUnique({ where: { joinCode } })) {
      joinCode = generateJoinCode();
    }

    const course = await prisma.course.create({
      data: {
        name,
        code: code || "COURSE",
        semester: semester || "2026",
        description,
        joinCode,
        teacherId,
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
