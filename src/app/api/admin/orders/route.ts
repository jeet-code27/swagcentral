import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Order } from "@/models/Order";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(500).lean();
  return NextResponse.json({ success: true, orders });
}
