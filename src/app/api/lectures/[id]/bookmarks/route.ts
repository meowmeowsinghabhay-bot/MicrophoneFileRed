import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const studentId = request.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ bookmarks: [] });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { lectureId: id, studentId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookmarks });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { studentId, label, timestampMs, segmentId } = await request.json();

    if (!studentId || !label?.trim()) {
      return NextResponse.json(
        { error: "studentId and label are required" },
        { status: 400 }
      );
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        studentId,
        lectureId: id,
        label: label.trim(),
        timestampMs: timestampMs ?? null,
        segmentId: segmentId ?? null,
      },
    });

    return NextResponse.json({ bookmark });
  } catch (error) {
    console.error("Create bookmark error:", error);
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
  }
}
