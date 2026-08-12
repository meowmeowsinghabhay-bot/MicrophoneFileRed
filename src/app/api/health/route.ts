import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDatabaseUrl } from "@/lib/database-url";
import { handleRouteError } from "@/lib/handle-route";

export async function GET() {
  try {
    const users = await prisma.user.count();
    return NextResponse.json({
      ok: true,
      db: "connected",
      users,
      pooler: getDatabaseUrl().includes("pgbouncer=true"),
    });
  } catch (error) {
    return handleRouteError(error, "Health check");
  }
}
