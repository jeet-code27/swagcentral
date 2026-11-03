import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { uploadRemoteImageToCloudinary } from "@/lib/cloudinary";
import { XMLParser } from "fast-xml-parser";
import { requireAdmin } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog";

interface ParsedWPProduct {
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  wpImageUrl: string;
  accessUrl?: string;
  pdfFileName?: string;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawJson = formData.get("json") as string | null;
    const uploadImagesToCloudinary = formData.get("uploadToCloudinary") === "true";

    let productsToImport: ParsedWPProduct[] = [];

    if (rawJson) {
      productsToImport = JSON.parse(rawJson);
    } else if (file) {
      const fileText = await file.text();

      if (file.name.endsWith(".xml")) {
        // Parse WordPress WXR XML
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
        });
        const xmlData = parser.parse(fileText);

        const channel = xmlData?.rss?.channel;
        const items = Array.isArray(channel?.item) ? channel.item : channel?.item ? [channel.item] : [];

        for (const item of items) {
          // WooCommerce/WP export item
          const title = item.title || "Untitled Product";
          const description = item["content:encoded"] || item.description || "";
          const slug = item["wp:post_name"] || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const category = item.category
            ? (Array.isArray(item.category) ? item.category[0] : item.category)
            : "digital-assets";

          // Try to extract image URL from enclosures or post meta
          let wpImageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";
          if (item["wp:attachment_url"]) {
            wpImageUrl = item["wp:attachment_url"];
          }

          productsToImport.push({
            title,
            slug,
            description,
            price: 299,
            originalPrice: 799,
            category: typeof category === "string" ? category : category["#text"] || "General",
            wpImageUrl,
          });
        }
      } else if (file.name.endsWith(".csv")) {
        // Simple CSV parser for WooCommerce product export
        const lines = fileText.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

        const titleIdx = headers.findIndex((h) => h.toLowerCase().includes("name") || h.toLowerCase().includes("title"));
        const priceIdx = headers.findIndex((h) => h.toLowerCase().includes("regular price") || h.toLowerCase().includes("price"));
        const catIdx = headers.findIndex((h) => h.toLowerCase().includes("categories") || h.toLowerCase().includes("category"));
        const imgIdx = headers.findIndex((h) => h.toLowerCase().includes("images") || h.toLowerCase().includes("image"));
        const descIdx = headers.findIndex((h) => h.toLowerCase().includes("description"));

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          if (!row[titleIdx]) continue;

          const title = row[titleIdx];
          const price = parseFloat(row[priceIdx]) || 299;
          const category = row[catIdx] || "Digital Products";
          const wpImageUrl = row[imgIdx] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";
          const description = row[descIdx] || "Digital product ready for download.";

          productsToImport.push({
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            description,
            price,
            originalPrice: price * 2,
            category,
            wpImageUrl,
          });
        }
      }
    }

    if (productsToImport.length === 0) {
      return NextResponse.json(
        { error: "No products could be parsed from the provided file or JSON." },
        { status: 400 }
      );
    }

    await connectDB();

    const progressLogs: string[] = [];
    let savedCount = 0;

    for (let i = 0; i < productsToImport.length; i++) {
      const p = productsToImport[i];
      let finalImageUrl = p.wpImageUrl;

      // Upload image to Cloudinary if requested
      if (uploadImagesToCloudinary && p.wpImageUrl && p.wpImageUrl.startsWith("http")) {
        progressLogs.push(`[Cloudinary] Uploading WP image for: ${p.title}`);
        const cRes = await uploadRemoteImageToCloudinary(p.wpImageUrl, "swagcentral/products");
        if (cRes?.url) {
          finalImageUrl = cRes.url;
          progressLogs.push(`✓ Re-hosted to Cloudinary: ${cRes.url}`);
        }
      }

      // Upsert Category in MongoDB
      const categorySlug = p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      try {
        await Category.findOneAndUpdate(
          { slug: categorySlug },
          {
            name: p.category,
            slug: categorySlug,
            image: finalImageUrl,
          },
          { upsert: true, new: true }
        );
      } catch (catErr) {
        // Continue
      }

      // Upsert Product in MongoDB
      try {
        await Product.findOneAndUpdate(
          { slug: p.slug },
          {
            title: p.title,
            slug: p.slug,
            category: categorySlug,
            categoryName: p.category,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice || p.price * 2,
            discountPercentage: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) || 50,
            thumbnail: finalImageUrl,
            images: [finalImageUrl],
            deliveryType: p.pdfFileName ? "both" : "link",
            accessUrl: p.accessUrl || "https://drive.google.com/drive/folders/swagcentral-hub",
            pdfFileName: p.pdfFileName || "",
            status: "active",
          },
          { upsert: true, new: true }
        );
        savedCount++;
        progressLogs.push(`✓ Saved to MongoDB: ${p.title} (Price: ₹${p.price})`);
      } catch (prodErr) {
        progressLogs.push(`⚠️ Error saving ${p.title}: ${(prodErr as Error).message}`);
      }
    }

    // Refresh the cached storefront catalog
    revalidateTag(CATALOG_TAG, { expire: 0 });

    return NextResponse.json({
      success: true,
      importedCount: savedCount,
      totalParsed: productsToImport.length,
      logs: progressLogs,
    });
  } catch (error) {
    console.error("WP Import Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Import failed" },
      { status: 500 }
    );
  }
}
