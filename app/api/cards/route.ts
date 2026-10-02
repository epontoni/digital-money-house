import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getCardsByUserId, addCard, deleteCard } from "@/lib/db";

export async function GET(request: Request) {
  const user = getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const cards = getCardsByUserId(user.id);
  return NextResponse.json({ success: true, cards });
}

export async function POST(request: Request) {
  const user = getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newCard = addCard(user.id, {
      cardNumber: body.cardNumber,
      cardholderName: body.cardholderName,
      expiryDate: body.expiryDate,
      securityCode: body.securityCode,
    });

    return NextResponse.json({ success: true, card: newCard });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al dar de alta la tarjeta" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let cardId = searchParams.get("id");

    if (!cardId) {
      try {
        const body = await request.json();
        cardId = body.id;
      } catch {
        // no body
      }
    }

    if (!cardId) {
      return NextResponse.json({ error: "ID de tarjeta requerido" }, { status: 400 });
    }

    const result = deleteCard(user.id, cardId);
    return NextResponse.json({
      success: true,
      remainingCount: result.count,
      message: result.count === 0 ? "No tienes tarjetas asociadas" : "Tarjeta eliminada",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al eliminar la tarjeta" },
      { status: 400 }
    );
  }
}
