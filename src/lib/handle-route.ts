import { NextResponse } from "next/server";
import { isMissingTableError } from "./database-url";

export function handleRouteError(error: unknown, context: string): NextResponse {
  console.error(`${context}:`, error);

  if (isMissingTableError(error)) {
    const secret = process.env.SETUP_SECRET || "intellishala-setup-2026";
    return NextResponse.json(
      {
        error: "Database not initialized",
        setupUrl: `/api/setup-database?secret=${secret}`,
      },
      { status: 503 }
    );
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json(
    {
      error: "Request failed",
      ...(process.env.NODE_ENV === "development" ? { details: message } : {}),
    },
    { status: 500 }
  );
}
