import React from "react";
import { Metadata } from "next";
import { getActiveProducts, getCategoriesWithCounts } from "@/lib/catalog";
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
  let products: Awaited<ReturnType<typeof getActiveProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategoriesWithCounts>> = [];

  try {
    [products, categories] = await Promise.all([getActiveProducts(), getCategoriesWithCounts()]);
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
