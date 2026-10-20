import React from "react";
import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import HomeClient from "./HomeClient";

export const instant = false;

export const metadata: Metadata = {
  title: "SwagCentral | Best Digital Products, PLR Bundles & Templates",
  description:
    "Up to 40% - 75% off for all digital products, AI prompts, Canva templates, eBooks, reels bundles, and marketing tools. Instant digital download.",
  keywords: [
    "digital products",
    "canva templates",
    "ai prompts",
    "reels packs",
    "ebooks",
    "plr bundles",
    "swagcentral",
  ],
};

export default async function Home() {
  await connectDB();

  let products = [];
  let categories = [];

  try {
    const [pDocs, cDocs] = await Promise.all([
      Product.find({ status: "active" }).sort({ createdAt: -1 }).lean(),
      Category.find({}).sort({ orderIndex: 1 }).lean(),
    ]);

    products = JSON.parse(JSON.stringify(pDocs));
    categories = JSON.parse(JSON.stringify(cDocs));
  } catch (err) {
    console.warn("DB load error on homepage, using client fallbacks:", err);
  }

  return (
    <HomeClient
      initialProducts={products}
      initialCategories={categories}
    />
  );
}
