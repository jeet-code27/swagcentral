import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Product } from "@/models/Product";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const products = await Product.find({})
    .select("title slug category categoryName price originalPrice thumbnail deliveryType accessUrl pdfFileName status salesCount createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ success: true, products });
}
