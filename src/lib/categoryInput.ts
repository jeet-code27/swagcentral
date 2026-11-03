import { slugify } from "@/lib/productInput";

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function parseCategoryInput(
  body: Record<string, unknown>
): { data: { name: string; slug: string; image: string; description: string; orderIndex: number } } | { error: string } {
  const name = str(body.name, 120);
  const slug = slugify(str(body.slug, 120) || name);
  const image = str(body.image, 1000);
  const orderIndex = parseInt(String(body.orderIndex ?? 0), 10);

  if (!name) return { error: "Category name is required" };
  if (!slug) return { error: "Slug is required" };
  if (!image) return { error: "Add a category image" };

  return {
    data: {
      name,
      slug,
      image,
      description: str(body.description),
      orderIndex: Number.isFinite(orderIndex) ? orderIndex : 0,
    },
  };
}
