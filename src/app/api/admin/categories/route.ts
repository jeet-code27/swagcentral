import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
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
