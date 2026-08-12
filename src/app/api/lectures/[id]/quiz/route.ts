import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleRouteError } from "@/lib/handle-route";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { studentId, score, total, answers } = await request.json();

    if (!studentId || score == null || !total) {
      return NextResponse.json(
        { error: "studentId, score, and total are required" },
        { status: 400 }
      );
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId,
        lectureId: id,
        score: Number(score),
        total: Number(total),
        answers: typeof answers === "string" ? answers : JSON.stringify(answers ?? {}),
      },
    });

    return NextResponse.json({ attempt });
  } catch (error) {
    return handleRouteError(error, "Quiz POST");
  }
}
