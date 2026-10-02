import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getActivitiesByUserId } from "@/lib/db";

export async function GET(request: Request) {
  const user = getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam !== null ? parseInt(limitParam, 10) : 10;
  const q = searchParams.get("q") || undefined;

  const activities = getActivitiesByUserId(user.id, limit, q);
  return NextResponse.json({ success: true, activities });
}
