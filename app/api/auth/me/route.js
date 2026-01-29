import { getBearerToken, verifyToken } from "@/lib/auth";

export async function GET(req) {
  const token = getBearerToken(req);
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return Response.json({ error: true, message: "Unauthorized" }, { status: 401 });
  return Response.json({ error: false, user: decoded });
}
