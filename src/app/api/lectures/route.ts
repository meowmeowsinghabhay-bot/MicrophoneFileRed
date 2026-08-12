import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleRouteError } from "@/lib/handle-route";

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId");
    const publishedOnly = request.nextUrl.searchParams.get("published") === "true";

    const lectures = await prisma.lecture.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(publishedOnly ? { published: true } : {}),
      },
      include: { _count: { select: { segments: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ lectures });
  } catch (error) {
    return handleRouteError(error, "Lectures GET");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { courseId, title, description, segments, contentBlocks } = await request.json();

    const lecture = await prisma.lecture.create({
      data: {
        courseId,
        title,
        description,
        published: false,
        durationMs: segments?.length
          ? segments[segments.length - 1]?.endMs
          : undefined,
        segments: segments
          ? {
              create: segments.map(
                (s: { text: string; translatedText?: string; startMs: number; endMs: number; isImportant?: boolean }, i: number) => ({
                  text: s.text,
                  translatedText: s.translatedText,
                  startMs: s.startMs,
                  endMs: s.endMs,
                  isImportant: s.isImportant ?? false,
                  orderIndex: i,
                })
              ),
            }
          : undefined,
        contentBlocks: contentBlocks
          ? {
              create: contentBlocks.map((b: { type: string; content: string; status?: string }) => ({
                type: b.type,
                content: b.content,
                status: b.status || "AI Generated",
              })),
            }
          : undefined,
      },
      include: { segments: true, contentBlocks: true },
    });

    return NextResponse.json({ lecture });
  } catch (error) {
    return handleRouteError(error, "Lectures POST");
  }
}
