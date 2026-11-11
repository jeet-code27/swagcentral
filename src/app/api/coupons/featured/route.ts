import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { couponLabel } from "@/lib/coupons";

/** The coupon shown in the homepage banner (or none). */
export async function GET() {
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ coupon: null });

  const now = new Date();
  const coupon = await Coupon.findOne({
    active: true,
    featured: true,
    $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
  })
    .sort({ updatedAt: -1 })
    .lean();

  if (!coupon || (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)) {
    return NextResponse.json({ coupon: null });
  }
  return NextResponse.json({
    coupon: { code: coupon.code, label: couponLabel(coupon), description: coupon.description },
  });
}
