import type { NextConfig } from "next";
import { LEGACY_PRODUCT_SLUGS } from "./src/data/legacyProductSlugs";

/**
 * Permanent redirects from the old WordPress/WooCommerce site on swagcentral.in,
 * so links already in Google and on social media keep working after the switch.
 */
const legacyRedirects = [
  // Products whose URL changed
  ...Object.entries(LEGACY_PRODUCT_SLUGS).map(([oldSlug, newSlug]) => ({
    source: `/product/${oldSlug}`,
    destination: `/product/${newSlug}`,
    permanent: true,
  })),
  // Category and tag archives
  { source: "/product-category/:slug/page/:page", destination: "/shop?category=:slug", permanent: true },
  { source: "/product-category/:slug", destination: "/shop?category=:slug", permanent: true },
  { source: "/product-tag/:tag*", destination: "/shop", permanent: true },
  { source: "/shop/page/:page", destination: "/shop", permanent: true },
  // WooCommerce / WordPress pages with new addresses
  { source: "/privacy-policy", destination: "/privacy", permanent: true },
  { source: "/terms-of-service", destination: "/terms", permanent: true },
  { source: "/shipping-policy", destination: "/help", permanent: true },
  { source: "/my-account/:path*", destination: "/account", permanent: true },
  { source: "/cart", destination: "/checkout", permanent: true },
  { source: "/sample-page", destination: "/", permanent: true },
  { source: "/category/:path*", destination: "/", permanent: true },
  { source: "/author/:path*", destination: "/", permanent: true },
  { source: "/2025/:path*", destination: "/", permanent: true },
  // Yoast SEO sitemaps
  { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
  { source: "/:type(post|page|product|product_cat|product_tag|category|author|elementskit_template|mailpoet_page|metform-form)-sitemap.xml", destination: "/sitemap.xml", permanent: true },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
