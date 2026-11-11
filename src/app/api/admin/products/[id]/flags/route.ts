import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { Product } from "@/models/Product";

const FLAGS = ["isBestSeller", "isNewArrival", "isOnSale", "isTrending", "isFeatured"] as const;

/** Quick on/off for the homepage sections (Best Seller, New Arrival, On Sale, Trending, Featured). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, boolean> = {};
  for (const flag of FLAGS) {
    if (typeof body[flag] === "boolean") update[flag] = body[flag];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const product = await Product.findByIdAndUpdate(id, update, { new: true })
    .select("isBestSeller isNewArrival isOnSale isTrending isFeatured")
    .lean();
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ success: true, product });
}
