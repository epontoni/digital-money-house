import { NextResponse } from "next/server";
import { confirmNewEmail } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token de confirmación requerido" }, { status: 400 });
    }

    const result = confirmNewEmail(token);
    return NextResponse.json({
      success: true,
      message: "Tu nuevo correo electrónico ha sido confirmado exitosamente",
      email: result.email,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al confirmar correo" }, { status: 400 });
  }
}
