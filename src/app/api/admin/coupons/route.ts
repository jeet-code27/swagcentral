import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Coupon } from "@/models/Coupon";
import { parseCouponInput } from "@/lib/couponInput";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, coupons });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const parsed = parseCouponInput(await req.json());
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (await Coupon.exists({ code: parsed.data.code })) {
    return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
  }

  // Only one coupon is shown on the homepage at a time
  if (parsed.data.featured) await Coupon.updateMany({}, { featured: false });
  const coupon = await Coupon.create(parsed.data);
  return NextResponse.json({ success: true, coupon: coupon.toObject() }, { status: 201 });
}
