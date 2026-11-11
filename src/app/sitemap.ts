import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

const STATIC_PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/help", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/accessibility", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: absoluteUrl(p.path),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  try {
    const { products, categories } = await getSitemapData();
    for (const c of categories) {
      entries.push({
        url: absoluteUrl(`/shop?category=${encodeURIComponent(c.slug)}`),
        lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    for (const p of products) {
      entries.push({
        url: absoluteUrl(`/product/${p.slug}`),
        lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (err) {
    console.warn("Sitemap: catalog unavailable, listing static pages only", err);
  }

  return entries;
}
