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
