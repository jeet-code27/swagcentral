import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { parseCategoryInput } from "@/lib/categoryInput";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const [categories, counts] = await Promise.all([
    Category.find({}).sort({ orderIndex: 1, name: 1 }).lean(),
    Product.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);
  const countMap = new Map(counts.map((c) => [c._id, c.count]));

  return NextResponse.json({
    success: true,
    categories: categories.map((c) => ({ ...c, count: countMap.get(c.slug) || 0 })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const parsed = parseCategoryInput(await req.json());
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (await Category.exists({ slug: parsed.data.slug })) {
    return NextResponse.json({ error: "Another category already uses this slug" }, { status: 409 });
  }

  const category = await Category.create(parsed.data);
  revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ success: true, category: category.toObject() }, { status: 201 });
}
