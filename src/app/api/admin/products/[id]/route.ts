import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { parseProductInput } from "@/lib/productInput";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";

type Ctx = { params: Promise<{ id: string }> };

async function setup(ctx: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return { response: auth };

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return { response: NextResponse.json({ error: "Product not found" }, { status: 404 }) };
  }

  const conn = await connectDB();
  if (!conn) {
    return { response: NextResponse.json({ error: "Database unavailable" }, { status: 503 }) };
  }
  return { id };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id, response } = await setup(ctx);
  if (response) return response;

  const product = await Product.findById(id).lean();
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Order stats for the product's view page
  const [stats] = await Order.aggregate<{ orders: number; delivered: number; revenue: number }>([
    { $match: { "items.productId": id } },
    { $unwind: "$items" },
    { $match: { "items.productId": id } },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        delivered: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] } },
        revenue: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, "$items.price", 0] } },
      },
    },
  ]);

  return NextResponse.json({
    success: true,
    product,
    stats: stats || { orders: 0, delivered: 0, revenue: 0 },
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id, response } = await setup(ctx);
  if (response) return response;

  const parsed = await parseProductInput(await req.json());
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (await Product.exists({ slug: parsed.data.slug, _id: { $ne: id } })) {
    return NextResponse.json({ error: "Another product already uses this slug" }, { status: 409 });
  }

  const product = await Product.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true }).lean();
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ success: true, product });
}
