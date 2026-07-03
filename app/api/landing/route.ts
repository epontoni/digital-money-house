import { NextResponse } from "next/server";
import { getLandingPageData } from "@/lib/db";

export async function GET() {
  try {
    const data = getLandingPageData();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ocurrió un error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
