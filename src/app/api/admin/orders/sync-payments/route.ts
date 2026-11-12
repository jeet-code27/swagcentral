import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { syncUnpaidOrders } from "@/lib/orderPayment";

/** Re-checks recent unpaid orders with PayU and stores the result / failure reason. */
export async function POST() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  try {
    const result = await syncUnpaidOrders();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("PayU sync error:", error);
    return NextResponse.json({ error: "Could not check payments with PayU" }, { status: 500 });
  }
}
