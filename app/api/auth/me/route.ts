import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payloadJson = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (payload.exp < Date.now()) {
      return NextResponse.json({ error: "Token expirado" }, { status: 401 });
    }

    const user = getUserById(payload.id);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
