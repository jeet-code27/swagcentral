import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or per-customer pages
      disallow: ["/admin", "/api/", "/checkout", "/account", "/download/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
