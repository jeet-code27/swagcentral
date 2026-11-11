import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { Product } from "@/models/Product";

/**
 * Saves the store display order. Body: { ids: string[] } with every product in the
 * order it should appear (first = top of the store).
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === "string") : [];
  if (ids.length === 0 || ids.some((id) => !mongoose.isValidObjectId(id))) {
    return NextResponse.json({ error: "Send the product IDs in display order" }, { status: 400 });
  }

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  await Product.bulkWrite(
    ids.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index + 1 } } },
    }))
  );

  revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ success: true });
}
