import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, code } = body;

    if (!email || !password || !code) {
      return NextResponse.json(
        { error: "Todos los campos (email, contraseña, código) son requeridos" },
        { status: 400 }
      );
    }

    const result = authenticateUser(email, password, code);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ocurrió un error inesperado";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
