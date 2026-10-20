import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { connectDB } from "../lib/db";
import { Product } from "../models/Product";
import { formatProductDescription, formatShortDescription } from "../lib/formatter";

async function main() {
  await connectDB();
  const products = await Product.find({});
  console.log(`Processing ${products.length} products...`);

  let updatedCount = 0;
  for (const p of products) {
    const originalDesc = p.description;
    const originalShort = p.shortDescription || "";

    const newDesc = formatProductDescription(originalDesc);
    const newShort = formatShortDescription(originalShort);

    if (newDesc !== originalDesc || newShort !== originalShort) {
      p.description = newDesc;
      p.shortDescription = newShort;
      await p.save();
      updatedCount++;
      console.log(`✓ Updated: [${p.title}]`);
    }
  }

  console.log(`\nMigration Complete: Cleaned ${updatedCount} products in MongoDB.`);
  process.exit(0);
}

main();
