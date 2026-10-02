import { getUserById } from "./db";

export function getAuthenticatedUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    const payloadJson = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (!payload.id || (payload.exp && payload.exp < Date.now())) {
      return null;
    }

    const user = getUserById(payload.id);
    return user;
  } catch {
    return null;
  }
}
