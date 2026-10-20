import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { CATEGORIES, PRODUCTS } from "../data/mockData";

async function seed() {
  console.log("Connecting to MongoDB Atlas at:", process.env.MONGODB_URI ? "URI Loaded" : "No URI");
  await connectDB();

  console.log("Seeding Categories...");
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    await Category.findOneAndUpdate(
      { slug: cat.slug },
      {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: `Premium digital assets for ${cat.name}`,
        orderIndex: i,
      },
      { upsert: true, new: true }
    );
  }
  console.log(`✓ ${CATEGORIES.length} Categories seeded into MongoDB Atlas.`);

  console.log("Seeding Products...");
  for (const prod of PRODUCTS) {
    await Product.findOneAndUpdate(
      { slug: prod.slug },
      {
        title: prod.title,
        slug: prod.slug,
        category: prod.category,
        categoryName: prod.categoryName,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice,
        discountPercentage: prod.discountPercentage || 0,
        badge: prod.badge || "",
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        images: prod.images,
        thumbnail: prod.thumbnail,
        deliveryType: prod.deliveryType,
        accessUrl: prod.accessUrl,
        pdfFileName: prod.pdfFileName || "",
        features: prod.features,
        isFeatured: prod.isFeatured || false,
        isNewArrival: prod.isNewArrival || false,
        isBestSeller: prod.isBestSeller || false,
        isOnSale: prod.isOnSale || false,
        isTrending: prod.isTrending || false,
        status: "active",
      },
      { upsert: true, new: true }
    );
  }
  console.log(`✓ ${PRODUCTS.length} Digital Products seeded into MongoDB Atlas.`);

  console.log("🎉 Database seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
