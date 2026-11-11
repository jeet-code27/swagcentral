import { getSitemapData } from "@/lib/catalog";
import { SITE, absoluteUrl } from "@/lib/site";
import { clip, plainText } from "@/lib/seo";

/**
 * /llms.txt — a plain-markdown summary of the store for AI assistants and LLM crawlers
 * (https://llmstxt.org). Built from the live catalog.
 */
export async function GET() {
  let body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} is an online store in India (${SITE.location}) selling digital products: AI prompt packs, Canva templates, reels and video bundles, eBooks, study material and PLR (resell rights) bundles. Prices are in Indian rupees. Payment is online through PayU (UPI, cards, net banking, wallets). After payment, customers get an order confirmation email and their download links by email ${SITE.deliveryPromise}.

## Key pages

- [Shop all products](${absoluteUrl("/shop")}): full catalog with categories, search and prices
- [FAQ & Support](${absoluteUrl("/help")}): payments, delivery time, downloads and refunds
- [Refund & Cancellation Policy](${absoluteUrl("/refund-policy")}): when orders can be refunded or cancelled
- [About](${absoluteUrl("/about")}): who we are and how buying works
- [Contact](${absoluteUrl("/contact")}): WhatsApp ${SITE.whatsapp}, email ${SITE.email}
- [Terms of Service](${absoluteUrl("/terms")}) and [Privacy Policy](${absoluteUrl("/privacy")})
`;

  try {
    const { products, categories } = await getSitemapData();

    if (categories.length) {
      body += `\n## Categories\n\n`;
      for (const c of categories) {
        const count = products.filter((p) => p.category === c.slug).length;
        body += `- [${plainText(c.name)}](${absoluteUrl(`/shop?category=${encodeURIComponent(c.slug)}`)}): ${count} products\n`;
      }
    }

    if (products.length) {
      body += `\n## Products\n\n`;
      for (const p of products) {
        const summary = p.shortDescription ? `: ${clip(p.shortDescription, 140)}` : "";
        body += `- [${plainText(p.title)}](${absoluteUrl(`/product/${p.slug}`)}) — ₹${p.price}${summary}\n`;
      }
    }
  } catch {
    // Catalog unavailable: the static summary above is still useful
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
