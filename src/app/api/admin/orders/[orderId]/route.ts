import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

interface ItemUpdate {
  accessUrl?: string;
  pdfFileName?: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { orderId } = await params;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const order = await Order.findOne({ orderId }).lean();
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, order });
}

/**
 * Update an order's item access links (and optionally save them back to the product),
 * or change its status (e.g. cancel).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { orderId } = await params;
  const body = await req.json();
  const itemUpdates: ItemUpdate[] = Array.isArray(body.items) ? body.items : [];
  const saveToProduct = body.saveToProduct === true;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const order = await Order.findOne({ orderId });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  for (let i = 0; i < order.items.length && i < itemUpdates.length; i++) {
    const update = itemUpdates[i];
    if (!update) continue;
    const item = order.items[i];
    if (typeof update.accessUrl === "string") item.accessUrl = update.accessUrl.trim();
    if (typeof update.pdfFileName === "string") item.pdfFileName = update.pdfFileName.trim();

    if (saveToProduct && item.productId) {
      await Product.updateOne(
        { _id: item.productId },
        { accessUrl: item.accessUrl, pdfFileName: item.pdfFileName }
      ).catch(() => null);
    }
  }
  order.markModified("items");

  if (["pending", "delivered", "cancelled"].includes(body.orderStatus)) {
    order.orderStatus = body.orderStatus;
  }

  // Admin confirms a payment received outside PayU (e.g. direct UPI transfer)
  if (body.markPaid === true && order.paymentStatus !== "completed") {
    order.paymentStatus = "completed";
    order.paymentMode = "Marked paid by admin";
    order.paymentError = "";
    order.paidAt = new Date();
  }

  await order.save();
  return NextResponse.json({ success: true, order: order.toObject() });
}
