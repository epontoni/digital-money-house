import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getPaginatedActivities } from "@/lib/db";

export async function GET(request: Request) {
  const user = getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  const q = searchParams.get("q") || undefined;
  const period = searchParams.get("period") || undefined;
  const operation = searchParams.get("operation") || undefined;
  const amountRange = searchParams.get("amountRange") || undefined;

  const result = getPaginatedActivities(user.id, {
    page,
    limit,
    query: q,
    period,
    operation,
    amountRange,
  });

  return NextResponse.json({
    success: true,
    activities: result.activities,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    limit: result.limit,
  });
}
