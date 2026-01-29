import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { getBearerToken, verifyToken } from "@/lib/auth";

export async function GET(req) {
  await dbConnect();
  const url = new URL(req.url);
  const id = url.searchParams.get("orderId");
  if (!id) return Response.json({ error: true, message: "Missing orderId" }, { status: 400 });

  const token = getBearerToken(req);
  const user = token ? verifyToken(token) : null;
  if (!user) return Response.json({ error: true, message: "Unauthorized" }, { status: 401 });

  const order = await Order.findById(id);
  if (!order) return Response.json({ error: true, message: "Not found" }, { status: 404 });
  if (order.userId.toString() !== user.userId) {
    return Response.json({ error: true, message: "Forbidden" }, { status: 403 });
  }

  // Return base64 to client (client will download as PDF)
  return Response.json({
    error: false,
    pdfBase64: order.glsLabelBase64,
    trackingNumber: order.trackingNumber,
    status: order.status,
  });
}
