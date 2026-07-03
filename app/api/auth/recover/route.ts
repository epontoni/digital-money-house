import { NextResponse } from "next/server";
import { createPasswordRecoveryToken } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "El email es requerido" }, { status: 400 });
    }

    const result = createPasswordRecoveryToken(email);
    return NextResponse.json({
      success: true,
      message: "Enlace de recuperación generado",
      recoveryLink: result.recoveryLink,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ocurrió un error inesperado";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
