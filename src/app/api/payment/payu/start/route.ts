import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getPayuConfig } from "@/lib/payu";
import { startOrderPayment } from "@/lib/orderPayment";

/**
 * "Pay Now" from the order page: starts a new PayU attempt for an unpaid order.
 */
export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({ token: "" }));
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  if (!getPayuConfig()) {
    return NextResponse.json({ error: "Online payment is not available right now" }, { status: 503 });
  }

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const order = await Order.findOne({ downloadToken: String(token) });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.paymentStatus === "completed") {
    return NextResponse.json({ error: "This order is already paid" }, { status: 400 });
  }
  if (order.orderStatus === "cancelled") {
    return NextResponse.json({ error: "This order was cancelled" }, { status: 400 });
  }

  const payment = await startOrderPayment(order);
  return NextResponse.json({ success: true, payment });
}
