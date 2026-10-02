import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { updateUserProfile } from "@/lib/db";

export async function GET(request: Request) {
  const user = getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json({ success: true, user });
}

export async function PUT(request: Request) {
  const user = getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = updateUserProfile(user.id, {
      name: body.name,
      lastName: body.lastName,
      phone: body.phone,
      cuit: body.cuit,
      alias: body.alias,
      email: body.email,
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      emailConfirmationSent: result.emailConfirmationSent,
      confirmationLink: result.confirmationLink,
      message: result.emailConfirmationSent
        ? "Datos actualizados. Se envió un correo de confirmación para validar el nuevo email."
        : "Datos guardados correctamente",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al actualizar perfil" }, { status: 400 });
  }
}
