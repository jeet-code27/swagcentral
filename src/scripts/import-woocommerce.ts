import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { connectDB } from "../lib/db";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { uploadRemoteImageToCloudinary } from "../lib/cloudinary";
import { formatProductDescription, formatShortDescription } from "../lib/formatter";

// Robust CSV parser supporting multiline quotes
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.replace(/^"|"$/g, "").trim());
  const results: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const record: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      record[headers[c]] = row[c] !== undefined ? row[c] : "";
    }
    results.push(record);
  }

  return results;
}

// Category fallback visual images
const CATEGORY_ICONS: Record<string, string> = {
  "ai-tools-prompts": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  "business-marketing-bundles": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  "ebooks-digital-books": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
  "fitness-health-content": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
  "marketing-seo-tools": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  "video-reels-packs": "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80",
  "templates-creatives": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80",
  "exam-study-material": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
  "plr-reseller-bundles": "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80",
};

async function runMigration() {
  console.log("=== Starting WooCommerce Products & Categories Clean Import ===");

  await connectDB();
  console.log("✓ Connected to MongoDB Atlas");

  // 1. Clear out previous products and categories
  console.log("Clearing existing mock products and categories from database...");
  await Product.deleteMany({});
  await Category.deleteMany({});
  console.log("✓ All old products and categories removed successfully.");

  // 2. Read and parse CSV file
  const csvPath = path.resolve(process.cwd(), "wc-product-export-19-10-2026-1792407429850.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const records = parseCSV(csvContent);
  console.log(`✓ Parsed ${records.length} records from WooCommerce export CSV.`);

  const categoriesMap = new Map<string, { name: string; slug: string; image: string; count: number }>();

  let importedCount = 0;

  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    const name = item["Name"];
    if (!name || name.trim() === "") continue;

    const rawSku = item["SKU"] || "";
    const slug = (rawSku || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const rawShortDesc = item["Short description"] || "";
    const rawDesc = item["Description"] || rawShortDesc || name;
    const shortDesc = formatShortDescription(rawShortDesc);
    const description = formatProductDescription(rawDesc);

    const salePriceNum = parseFloat(item["Sale price"]) || 0;
    const regPriceNum = parseFloat(item["Regular price"]) || 0;

    let price = salePriceNum > 0 ? salePriceNum : regPriceNum > 0 ? regPriceNum : 299;
    let originalPrice = regPriceNum > 0 ? regPriceNum : price > 200 ? price * 2 : 799;
    if (originalPrice < price) originalPrice = Math.round(price * 1.5);

    const discountPercentage = Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100));

    // Category handling
    const rawCategories = item["Categories"] || "Digital Products";
    const primaryCategory = rawCategories.split(",")[0].trim();
    const categorySlug = primaryCategory
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Track category in map
    if (!categoriesMap.has(categorySlug)) {
      categoriesMap.set(categorySlug, {
        name: primaryCategory,
        slug: categorySlug,
        image: CATEGORY_ICONS[categorySlug] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        count: 1,
      });
    } else {
      categoriesMap.get(categorySlug)!.count++;
    }

    // Images handling
    const rawImages = item["Images"] || "";
    const imageList = rawImages
      .split(",")
      .map((img) => img.trim())
      .filter((img) => img.startsWith("http"));

    let thumbnail = imageList[0] || CATEGORY_ICONS[categorySlug] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";

    // Attempt Cloudinary upload with timeout fallback
    if (thumbnail.startsWith("http") && !thumbnail.includes("res.cloudinary.com") && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        console.log(`[${i + 1}/${records.length}] Syncing image to Cloudinary for: ${name.slice(0, 30)}...`);
        const cRes = await uploadRemoteImageToCloudinary(thumbnail, "swagcentral/products");
        if (cRes?.url) {
          thumbnail = cRes.url;
        }
      } catch (cErr) {
        // Fallback: keep original image url
        console.warn(`Cloudinary note for ${name}: Using direct URL`);
      }
    }

    // If category has default placeholder, update category image with first product image
    const catEntry = categoriesMap.get(categorySlug);
    if (catEntry && catEntry.image.includes("unsplash") && thumbnail) {
      catEntry.image = thumbnail;
    }

    // SEO Meta fields from Yoast
    const metaTitle = item["Meta: _yoast_wpseo_title"] || `${name} | SwagCentral`;
    const metaDescription = item["Meta: _yoast_wpseo_metadesc"] || shortDesc || `${name} instant digital download from SwagCentral.`;
    const focusKeyword = item["Meta: _yoast_wpseo_focuskw"] || "";

    // Tags
    const tags = (item["Tags"] || "")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Extract features or generate highlights
    const features = [
      "Instant Digital Download Access",
      "Lifetime Updates Included",
      "Full Commercial & Resell License",
      "Verified High-Speed Cloud Access",
    ];

    // Access link and PDF left empty as requested!
    await Product.create({
      wcId: item["ID"] || "",
      title: name,
      slug,
      category: categorySlug,
      categoryName: primaryCategory,
      description,
      shortDescription: shortDesc,
      price,
      originalPrice,
      discountPercentage,
      badge: discountPercentage >= 50 ? `${discountPercentage}% OFF` : "BESTSELLER",
      rating: 5,
      reviewCount: Math.floor(Math.random() * 60) + 15,
      images: [thumbnail],
      thumbnail,
      deliveryType: "both",
      accessUrl: "", // Left empty for user manual/automated assignment
      pdfFileName: "", // Left empty for user assignment
      features,
      tags,
      metaTitle,
      metaDescription,
      focusKeyword,
      isFeatured: i < 6,
      isNewArrival: i % 2 === 0,
      isBestSeller: i % 3 === 0,
      isOnSale: discountPercentage > 0,
      isTrending: i < 10,
      salesCount: Math.floor(Math.random() * 120) + 20,
      status: "active",
    });

    importedCount++;
  }

  console.log(`✓ ${importedCount} Products successfully created in MongoDB Atlas.`);

  // 3. Insert All Categories
  console.log("Upserting Categories in MongoDB Atlas...");
  let catIndex = 0;
  for (const [, cat] of categoriesMap.entries()) {
    await Category.create({
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      description: `Complete collection of ${cat.name} with instant digital access.`,
      orderIndex: catIndex++,
    });
  }
  console.log(`✓ ${categoriesMap.size} Categories successfully created in MongoDB Atlas:`, Array.from(categoriesMap.keys()));

  console.log("🎉 Complete WooCommerce Migration Finished Successfully!");
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
