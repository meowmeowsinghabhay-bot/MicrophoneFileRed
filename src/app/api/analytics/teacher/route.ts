import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get("teacherId");
  if (!teacherId) {
    return NextResponse.json({ error: "teacherId required" }, { status: 400 });
  }

  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: {
      lectures: true,
      enrollments: { include: { student: true } },
    },
  });

  const lectureIds = courses.flatMap((c) => c.lectures.map((l) => l.id));
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { lectureId: { in: lectureIds } },
  });

  const avgQuizScore =
    quizAttempts.length > 0
      ? quizAttempts.reduce((a, q) => a + (q.score / q.total) * 100, 0) / quizAttempts.length
      : 0;

  const students = courses.flatMap((c) => c.enrollments.map((e) => e.student));
  const uniqueStudents = [...new Map(students.map((s) => [s.id, s])).values()];

  const roster = await Promise.all(
    uniqueStudents.map(async (student) => {
      const attempts = quizAttempts.filter((a) => a.studentId === student.id);
      const avg =
        attempts.length > 0
          ? attempts.reduce((a, q) => a + (q.score / q.total) * 100, 0) / attempts.length
          : 0;
      const progress = await prisma.lectureProgress.count({
        where: { studentId: student.id, completed: true },
      });
      const lastActive = await prisma.lectureProgress.findFirst({
        where: { studentId: student.id },
        orderBy: { lastActive: "desc" },
      });
      return {
        readableId: student.readableId,
        displayName: student.displayName,
        lecturesCompleted: progress,
        avgQuizScore: Math.round(avg),
        lastActive: lastActive?.lastActive ?? null,
      };
    })
  );

  const bookmarks = await prisma.bookmark.groupBy({
    by: ["label"],
    _count: { label: true },
    orderBy: { _count: { label: "desc" } },
    take: 5,
  });

  return NextResponse.json({
    stats: {
      courseCount: courses.length,
      lectureCount: courses.reduce((a, c) => a + c.lectures.length, 0),
      activeStudents: uniqueStudents.length,
      avgQuizScore: Math.round(avgQuizScore),
    },
    roster,
    topBookmarks: bookmarks,
  });
}
