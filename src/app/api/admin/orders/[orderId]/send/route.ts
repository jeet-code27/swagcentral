import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Order } from "@/models/Order";
import { sendOrderDeliveryEmail } from "@/lib/mailer";

/**
 * Admin action: email the product access links to the customer and mark the order delivered.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { orderId } = await params;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const order = await Order.findOne({ orderId });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.orderStatus === "cancelled") {
    return NextResponse.json({ error: "Order is cancelled" }, { status: 400 });
  }

  const missing = order.items.filter((i) => !i.accessUrl && !i.pdfFileName);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Add an access link for: ${missing.map((i) => i.title).join(", ")}` },
      { status: 400 }
    );
  }

  const result = await sendOrderDeliveryEmail({
    orderId: order.orderId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items,
    totalAmount: order.totalAmount,
    downloadToken: order.downloadToken,
  });

  if (!result.success) {
    return NextResponse.json({ error: `Email failed: ${result.error}` }, { status: 502 });
  }

  order.orderStatus = "delivered";
  order.paymentStatus = "completed";
  order.emailSent = true;
  order.emailSentAt = new Date();
  order.deliveredAt = order.deliveredAt || new Date();
  await order.save();

  return NextResponse.json({ success: true, order: order.toObject() });
}
