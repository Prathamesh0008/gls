import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getBearerToken, verifyToken } from "@/lib/auth";
import { createGlsLabel } from "@/lib/gls";
import { zplToPdf } from "@/lib/labelary";
import { PRODUCTS } from "@/lib/products";

/**
 * CREATE ORDER + GLS LABEL
 */
export async function POST(req) {
  try {
    await dbConnect();
    console.log("🔥 /api/orders HIT");

    /* ---------------- AUTH ---------------- */
    const token = getBearerToken(req);
    if (!token) {
      return Response.json(
        { error: true, message: "Missing token" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return Response.json(
        { error: true, message: "Invalid token" },
        { status: 401 }
      );
    }

    /* ---------------- BODY ---------------- */
    const body = await req.json().catch(() => null);
    if (!body) {
      return Response.json(
        { error: true, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { cartItems, shipping } = body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return Response.json(
        { error: true, message: "Cart is empty" },
        { status: 400 }
      );
    }

    /* ---------------- PRODUCTS ---------------- */
    const productIds = cartItems
      .map((c) => c.productId)
      .filter(Boolean);

    if (productIds.length === 0) {
      return Response.json(
        { error: true, message: "Invalid cart items" },
        { status: 400 }
      );
    }

 const dbProducts = PRODUCTS.filter((p) =>
  productIds.includes(p.id)
);


    if (dbProducts.length === 0) {
      return Response.json(
        { error: true, message: "Products not found" },
        { status: 400 }
      );
    }

   const items = cartItems
  .map((c) => {
    const p = dbProducts.find((x) => x.id === c.productId);
    if (!p) return null;
    return {
      productId: p.id,
      name: p.name,
      price: p.price,
      qty: Number(c.qty || 1),
    };
  })
  .filter(Boolean);


    if (items.length === 0) {
      return Response.json(
        { error: true, message: "Invalid cart mapping" },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum, it) => sum + it.price * it.qty,
      0
    );

    /* ---------------- CREATE ORDER ---------------- */
    const reference =
      shipping?.reference || `ORD-${Date.now()}`;

    const order = await Order.create({
      userId: user.userId,
      items,
      totalAmount,
      shipping: {
        receiverName: shipping?.receiverName || user.name,
        street: shipping?.street || "Main Street",
        houseNo: shipping?.houseNo || "1",
        zipCode: shipping?.zipCode || "1012LG",
        city: shipping?.city || "Amsterdam",
        countryCode: shipping?.countryCode || "NL",
        weight: Number(shipping?.weight || 1),
        reference,
      },
      status: "creating_label",
    });

    /* ---------------- GLS PAYLOAD ---------------- */
    const glsPayload = {
      username: process.env.GLS_USERNAME,
      password: process.env.GLS_PASSWORD,

      shippingSystemName: "ASB Logistics",
      shippingSystemVersion: "1.0",
      shiptype: "p",

      customerNo: process.env.GLS_CUSTOMER_NO,
      customerSubjectName: "",

      reference,
      trackingLinkType: "u",

      units: [
        {
          unitId: "1",
          unitType: "co",
          customerUnitReference: reference,
          weight: Number(order.shipping.weight),
          dimensions: { length: 30, width: 20, height: 10 },
          additionalInfo1: "Web order",
          additionalInfo2: "Handle with care",
        },
      ],

      labelType: "zpl",
      returnRoutingData: true,

      addresses: {
        pickupAddress: {
          name1: "ASB Logistics",
          street: "Logisticsstraat",
          houseNo: "10",
          zipCode: "1012LG",
          city: "Amsterdam",
          countryCode: "NL",
          contact: "Warehouse",
          phone: "+31201234567",
          email: "warehouse@asblogistics.nl",
        },
        deliveryAddress: {
          name1: order.shipping.receiverName,
          street: order.shipping.street,
          houseNo: order.shipping.houseNo,
          zipCode: order.shipping.zipCode,
          city: order.shipping.city,
          countryCode: "NL",
          contact: order.shipping.receiverName,
          phone: "+31612345678",
          email: "customer@example.nl",
          addresseeType: "b",
        },
      },

      shippingDate: new Date().toISOString().slice(0, 10),

      services: {
        economyParcel: true,
        expressService: "none",
      },
    };

    /* ---------------- GLS CALL ---------------- */
    const glsRes = await createGlsLabel(glsPayload);

    const zpl = glsRes?.units?.[0]?.label;
    if (!zpl) {
      throw new Error("No ZPL returned from GLS");
    }

    const pdfBuffer = await zplToPdf(zpl);

    order.glsLabelBase64 = pdfBuffer.toString("base64");
    order.trackingNumber = glsRes.units[0].uniqueNo;
    order.status = "label_ready";
    await order.save();

    return Response.json({
      error: false,
      orderId: order._id,
    });

  } catch (err) {
    console.error("❌ ORDER ERROR:", err);
    return Response.json(
      { error: true, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * GET ORDER BY ID
 */
export async function GET(req) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id || id === "undefined") {
      return Response.json(
        { error: true, message: "Invalid order id" },
        { status: 400 }
      );
    }

    const token = getBearerToken(req);
    const user = token ? verifyToken(token) : null;
    if (!user) {
      return Response.json(
        { error: true, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return Response.json(
        { error: true, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId.toString() !== user.userId) {
      return Response.json(
        { error: true, message: "Forbidden" },
        { status: 403 }
      );
    }

    return Response.json({ error: false, order });

  } catch (err) {
    console.error("❌ GET ORDER ERROR:", err);
    return Response.json(
      { error: true, message: "Server error" },
      { status: 500 }
    );
  }
}
