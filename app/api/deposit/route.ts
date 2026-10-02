import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { createDeposit } from "@/lib/db";

export async function POST(request: Request) {
  const user = getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const amount = Number(body.amount);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "El monto a ingresar debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const result = createDeposit(user.id, {
      amount,
      cardId: body.cardId,
      cardLastFour: body.cardLastFour,
      type: body.type,
    });

    return NextResponse.json({
      success: true,
      activity: result.activity,
      newBalance: result.newBalance,
      user: result.user,
      message: "Ya cargamos el dinero en tu cuenta",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al ingresar dinero" },
      { status: 400 }
    );
  }
}
