import { NextResponse } from "next/server";
import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { payService } from "@/lib/db";

export async function POST(request: Request) {
  const user = getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      serviceId,
      accountNumber,
      amount,
      paymentMethod,
      cardId,
      cardLastFour,
      cardBrand,
    } = body;

    const result = payService(user.id, {
      serviceId,
      accountNumber,
      amount: Number(amount),
      paymentMethod,
      cardId,
      cardLastFour,
      cardBrand,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const isInsufficient = err.code === "INSUFFICIENT_FUNDS";
    return NextResponse.json(
      {
        error:
          err.message ||
          "Hubo un problema con tu pago. Puede deberse a fondos insuficientes.",
        code: err.code || "PAYMENT_FAILED",
      },
      { status: isInsufficient ? 402 : 400 }
    );
  }
}
