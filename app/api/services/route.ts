import { NextResponse } from "next/server";
import { getAvailableServices } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || undefined;
  const services = getAvailableServices(q);
  return NextResponse.json({ success: true, services });
}
