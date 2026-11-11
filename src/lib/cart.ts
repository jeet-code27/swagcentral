import mongoose from "mongoose";
import { Product } from "@/models/Product";

export type CartRef = { id?: string; slug?: string };

/**
 * Looks cart items up in the database so prices and delivery links can't be tampered with.
 * Only active products are returned.
 */
export async function resolveCartItems(items: CartRef[]) {
  const ids = items.map((i) => i.id).filter((id): id is string => !!id && mongoose.isValidObjectId(id));
  const slugs = items.map((i) => i.slug || i.id).filter((s): s is string => !!s);
  const products = await Product.find({
    status: "active",
    $or: [{ _id: { $in: ids } }, { slug: { $in: slugs } }],
  }).lean();

  return products.map((p) => ({
    productId: String(p._id),
    title: p.title,
    thumbnail: p.thumbnail,
    price: p.price,
    deliveryType: p.deliveryType || "link",
    accessUrl: p.accessUrl || "",
    pdfFileName: p.pdfFileName || "",
  }));
}
