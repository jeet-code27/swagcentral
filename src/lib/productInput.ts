import { Category } from "@/models/Category";
import type { DeliveryType } from "@/models/Product";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : NaN;
};
const list = (v: unknown) =>
  (Array.isArray(v) ? v : [])
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);

/**
 * Validates and normalises the product form body sent by the admin panel.
 * Returns either the cleaned fields or an error message.
 */
export async function parseProductInput(body: Record<string, unknown>) {
  const title = str(body.title, 300);
  const slug = slugify(str(body.slug, 200) || title);
  const category = str(body.category, 200);
  const price = num(body.price);
  const originalPrice = num(body.originalPrice);
  const images = list(body.images);
  const thumbnail = str(body.thumbnail, 1000) || images[0] || "";

  if (!title) return { error: "Title is required" } as const;
  if (!slug) return { error: "Slug is required" } as const;
  if (!Number.isFinite(price) || price < 0) return { error: "Enter a valid price" } as const;
  if (!thumbnail) return { error: "Add at least one product image" } as const;

  const categoryDoc = await Category.findOne({ slug: category }).lean();
  if (!categoryDoc) return { error: "Choose a valid category" } as const;

  const original = Number.isFinite(originalPrice) && originalPrice > price ? originalPrice : price;
  const deliveryType: DeliveryType = ["link", "pdf", "both"].includes(String(body.deliveryType))
    ? (String(body.deliveryType) as DeliveryType)
    : "link";
  const rating = num(body.rating);
  const reviewCount = num(body.reviewCount);

  return {
    data: {
      title,
      slug,
      category: categoryDoc.slug,
      categoryName: categoryDoc.name,
      shortDescription: str(body.shortDescription, 2000),
      description: str(body.description, 100000) || title,
      price,
      originalPrice: original,
      discountPercentage: original > price ? Math.round(((original - price) / original) * 100) : 0,
      badge: str(body.badge, 40),
      rating: Number.isFinite(rating) ? Math.min(Math.max(rating, 0), 5) : 5,
      reviewCount: Number.isFinite(reviewCount) ? Math.max(Math.round(reviewCount), 0) : 0,
      thumbnail,
      images: images.length ? images : [thumbnail],
      deliveryType,
      accessUrl: str(body.accessUrl, 1000),
      pdfFileName: str(body.pdfFileName, 300),
      features: list(body.features),
      tags: list(body.tags),
      metaTitle: str(body.metaTitle, 200),
      metaDescription: str(body.metaDescription, 400),
      focusKeyword: str(body.focusKeyword, 100),
      isFeatured: body.isFeatured === true,
      isNewArrival: body.isNewArrival === true,
      isBestSeller: body.isBestSeller === true,
      isOnSale: body.isOnSale === true,
      isTrending: body.isTrending === true,
      status: (body.status === "draft" ? "draft" : "active") as "draft" | "active",
    },
  };
}
