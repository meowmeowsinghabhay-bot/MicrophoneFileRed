import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleRouteError } from "@/lib/handle-route";
import { ensureStudentEnrollments } from "@/lib/ensure-enrollments";

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    const user = await prisma.user.findFirst({
      where: { username, password, role },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.role === "student") {
      await ensureStudentEnrollments(user.id);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        readableId: user.readableId,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    return handleRouteError(error, "Auth login");
  }
}
