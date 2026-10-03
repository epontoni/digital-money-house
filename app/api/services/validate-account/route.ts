import { NextResponse } from "next/server";
import { validateServiceAccount } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, accountNumber } = body;

    if (!serviceId || !accountNumber) {
      return NextResponse.json(
        { error: "Servicio y número de cuenta son requeridos" },
        { status: 400 }
      );
    }

    const result = validateServiceAccount(serviceId, accountNumber);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err.message ||
          "No encontramos facturas asociadas a este dato. Revisá el dato ingresado.",
      },
      { status: 400 }
    );
  }
}
