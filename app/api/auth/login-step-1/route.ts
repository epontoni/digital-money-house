import { NextResponse } from "next/server";
import { sendLoginVerificationCode } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "El email es obligatorio" }, { status: 400 });
    }

    const result = sendLoginVerificationCode(email);
    return NextResponse.json({ success: true, email: result.email, code: result.code });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ocurrió un error inesperado";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
