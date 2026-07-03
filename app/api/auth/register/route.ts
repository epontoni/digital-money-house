import { NextResponse } from "next/server";
import { registerUser } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, lastName, email, password, phone } = body;

    // Server-side validation checks
    if (!name || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben completarse" },
        { status: 400 }
      );
    }

    const result = registerUser({ name, lastName, email, password, phone });
    return NextResponse.json({ success: true, user: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ocurrió un error inesperado";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
