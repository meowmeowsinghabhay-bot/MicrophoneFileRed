import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleRouteError } from "@/lib/handle-route";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: {
        segments: { orderBy: { orderIndex: "asc" } },
        contentBlocks: true,
        course: { include: { teacher: { select: { displayName: true } } } },
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ lecture });
  } catch (error) {
    return handleRouteError(error, "Lecture GET");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const lecture = await prisma.lecture.update({
      where: { id },
      data: {
        ...(body.published !== undefined ? { published: body.published } : {}),
        ...(body.title ? { title: body.title } : {}),
      },
    });

    if (body.contentBlock) {
      const { blockId, content, status } = body.contentBlock;
      await prisma.contentBlock.update({
        where: { id: blockId },
        data: { content, status: status || "Teacher Edited" },
      });
    }

    return NextResponse.json({ lecture });
  } catch (error) {
    return handleRouteError(error, "Lecture PATCH");
  }
}
