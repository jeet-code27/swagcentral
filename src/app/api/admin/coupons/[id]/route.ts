import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Coupon } from "@/models/Coupon";
import { parseCouponInput } from "@/lib/couponInput";

type Ctx = { params: Promise<{ id: string }> };

async function setup(ctx: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return { response: auth };
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return { response: NextResponse.json({ error: "Coupon not found" }, { status: 404 }) };
  }
  const conn = await connectDB();
  if (!conn) return { response: NextResponse.json({ error: "Database unavailable" }, { status: 503 }) };
  return { id };
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id, response } = await setup(ctx);
  if (response) return response;

  const body = await req.json();
  const coupon = await Coupon.findById(id);
  if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

  // Quick toggles from the list, or a full edit
  if (Object.keys(body).every((k) => k === "active" || k === "featured")) {
    if (typeof body.active === "boolean") coupon.active = body.active;
    if (typeof body.featured === "boolean") coupon.featured = body.featured;
  } else {
    const parsed = parseCouponInput(body);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    if (await Coupon.exists({ code: parsed.data.code, _id: { $ne: id } })) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
    }
    coupon.set(parsed.data);
    if (!parsed.data.expiresAt) coupon.set("expiresAt", undefined);
  }

  if (coupon.featured) await Coupon.updateMany({ _id: { $ne: id } }, { featured: false });
  await coupon.save();
  return NextResponse.json({ success: true, coupon: coupon.toObject() });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id, response } = await setup(ctx);
  if (response) return response;
  await Coupon.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
