import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { parseCategoryInput } from "@/lib/categoryInput";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";

type Ctx = { params: Promise<{ id: string }> };

async function setup(ctx: Ctx) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return { response: auth };

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return { response: NextResponse.json({ error: "Category not found" }, { status: 404 }) };
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

  const category = await Category.findById(id).lean();
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const products = await Product.find({ category: category.slug })
    .select("title slug price originalPrice thumbnail status accessUrl pdfFileName")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ success: true, category, products });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id, response } = await setup(ctx);
  if (response) return response;

  const parsed = parseCategoryInput(await req.json());
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const existing = await Category.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  if (await Category.exists({ slug: parsed.data.slug, _id: { $ne: id } })) {
    return NextResponse.json({ error: "Another category already uses this slug" }, { status: 409 });
  }

  const oldSlug = existing.slug;
  existing.set(parsed.data);
  await existing.save();

  // Keep products pointing at this category in sync with its new slug / name
  await Product.updateMany(
    { category: oldSlug },
    { category: existing.slug, categoryName: existing.name }
  );

  revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ success: true, category: existing.toObject() });
}
