import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token y nueva contraseña son requeridos" },
        { status: 400 }
      );
    }

    const result = resetPassword(token, password);
    return NextResponse.json({ success: true, email: result.email });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ocurrió un error inesperado";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
