import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleRouteError } from "@/lib/handle-route";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const progress = await prisma.lectureProgress.findMany({
      where: { studentId: id },
      include: {
        lecture: {
          include: { course: { select: { name: true, code: true } } },
        },
      },
      orderBy: { lastActive: "desc" },
    });

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { studentId: id },
    });

    const bookmarks = await prisma.bookmark.findMany({
      where: { studentId: id },
      include: { lecture: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const avgQuiz =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((a, q) => a + (q.score / q.total) * 100, 0) / quizAttempts.length
          )
        : 0;

    const completed = progress.filter((p) => p.completed).length;

    const continueLearning = progress.find((p) => !p.completed && p.lecture);

    return NextResponse.json({
      stats: {
        lecturesCompleted: completed,
        lecturesInProgress: progress.filter((p) => !p.completed).length,
        avgQuizScore: avgQuiz,
        totalBookmarks: bookmarks.length,
      },
      continueLearning: continueLearning
        ? {
            lectureId: continueLearning.lectureId,
            title: continueLearning.lecture.title,
            course: continueLearning.lecture.course.name,
            lastPositionMs: continueLearning.lastPositionMs,
            progressPct: Math.round(
              (continueLearning.lastPositionMs / (continueLearning.lecture.durationMs || 1)) * 100
            ),
          }
        : null,
      recentProgress: progress.slice(0, 5).map((p) => ({
        lectureId: p.lectureId,
        title: p.lecture.title,
        course: p.lecture.course.name,
        completed: p.completed,
        progressPct: Math.round((p.lastPositionMs / (p.lecture.durationMs || 1)) * 100),
      })),
      bookmarks,
    });
  } catch (error) {
    return handleRouteError(error, "Student dashboard");
  }
}
