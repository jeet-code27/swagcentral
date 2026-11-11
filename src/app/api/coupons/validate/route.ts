import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { resolveCartItems } from "@/lib/cart";
import { applyCoupon } from "@/lib/coupons";

/** Checks a coupon against the customer's cart (prices come from the database). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];
  if (!body.code || items.length === 0) {
    return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });
  }

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Please try again in a minute" }, { status: 503 });

  const orderItems = await resolveCartItems(items);
  const subtotal = orderItems.reduce((sum, i) => sum + i.price, 0);
  const result = await applyCoupon(String(body.code), subtotal);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ success: true, ...result, subtotal, total: subtotal - result.discount });
}
