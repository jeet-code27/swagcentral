import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

/** Fields needed to render product cards (excludes the heavy HTML description). */
const CARD_FIELDS =
  "title slug category categoryName shortDescription price originalPrice discountPercentage badge rating reviewCount thumbnail deliveryType features isFeatured isNewArrival isBestSeller isOnSale isTrending salesCount focusKeyword createdAt";

export const CATALOG_TAG = "catalog";

async function requireDB() {
  const conn = await connectDB();
  // Throwing (instead of returning empty data) keeps a failed DB call out of the cache
  if (!conn) throw new Error("Database unavailable");
}

function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function getActiveProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  await requireDB();
  const docs = await Product.find({ status: "active" })
    .select(CARD_FIELDS)
    .sort({ createdAt: -1 })
    .lean();
  return toPlain(docs);
}

export async function getCategoriesWithCounts() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  await requireDB();
  const [categories, counts] = await Promise.all([
    Category.find({}).sort({ orderIndex: 1 }).lean(),
    Product.aggregate<{ _id: string; count: number }>([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);
  const countMap = new Map(counts.map((c) => [c._id, c.count]));
  return toPlain(categories.map((c) => ({ ...c, count: countMap.get(c.slug) || 0 })));
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  await requireDB();
  const doc = await Product.findOne({ slug, status: "active" })
    .select("-accessUrl -pdfFileName")
    .lean();
  return doc ? toPlain(doc) : null;
}

export async function getRelatedProducts(category: string, excludeSlug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  await requireDB();
  const docs = await Product.find({ status: "active", category, slug: { $ne: excludeSlug } })
    .select(CARD_FIELDS)
    .limit(4)
    .lean();
  return toPlain(docs);
}

export async function getAllProductSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  await requireDB();
  const docs = await Product.find({ status: "active" }).select("slug").lean();
  return docs.map((d) => d.slug);
}

/** Product and category URLs for sitemap.xml and llms.txt. */
export async function getSitemapData() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  await requireDB();
  const [products, categories] = await Promise.all([
    Product.find({ status: "active" })
      .select("slug title price category categoryName shortDescription updatedAt")
      .sort({ createdAt: -1 })
      .lean(),
    Category.find({}).select("slug name description updatedAt").sort({ orderIndex: 1 }).lean(),
  ]);
  return toPlain({ products, categories });
}
