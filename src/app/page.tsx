import React from "react";
import { Metadata } from "next";
import { getActiveProducts, getCategoriesWithCounts } from "@/lib/catalog";
import HomeClient from "./HomeClient";

export const instant = false;

export const metadata: Metadata = {
  title: "SwagCentral | Digital Products, PLR Bundles & Templates",
  description:
    "Shop AI prompt packs, Canva templates, reels bundles, eBooks, study material and PLR bundles at low prices. Secure UPI payment, delivered by email.",
  alternates: { canonical: "/" },
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
