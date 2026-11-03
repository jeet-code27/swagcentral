import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { parseProductInput } from "@/lib/productInput";
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

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const parsed = await parseProductInput(await req.json());
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (await Product.exists({ slug: parsed.data.slug })) {
    return NextResponse.json({ error: "Another product already uses this slug" }, { status: 409 });
  }

  const product = await Product.create(parsed.data);
  revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ success: true, product: product.toObject() }, { status: 201 });
}
