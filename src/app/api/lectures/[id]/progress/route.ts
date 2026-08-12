import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const studentId = request.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ progress: null });
  }

  const progress = await prisma.lectureProgress.findUnique({
    where: { studentId_lectureId: { studentId, lectureId: id } },
  });

  return NextResponse.json({ progress });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { studentId, lastPositionMs, completed } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const progress = await prisma.lectureProgress.upsert({
      where: { studentId_lectureId: { studentId, lectureId: id } },
      create: {
        studentId,
        lectureId: id,
        lastPositionMs: lastPositionMs ?? 0,
        completed: completed ?? false,
      },
      update: {
        lastPositionMs: lastPositionMs ?? undefined,
        completed: completed ?? undefined,
        lastActive: new Date(),
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
