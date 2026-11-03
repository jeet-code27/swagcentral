import React, { Suspense } from "react";
import { Metadata } from "next";
import { getActiveProducts, getCategoriesWithCounts } from "@/lib/catalog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopClient from "@/app/shop/ShopClient";
import { Loader2 } from "lucide-react";

export const instant = false;

export const metadata: Metadata = {
  title: "Shop All Digital Products | Bundles, Prompts, Reels & Courses | SwagCentral",
  description:
    "Browse India's top collection of digital assets, AI prompt libraries, Canva templates, PLR bundles, ebooks, and marketing tools. Instant download access.",
  keywords: [
    "digital products store",
    "ai prompts bundle",
    "canva templates",
    "reels bundle",
    "plr reseller vault",
    "study material notes",
  ],
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-24 text-gray-400">
            <Loader2 size={32} className="animate-spin text-[#ff5500]" />
          </div>
        }
      >
        <ShopClient initialProducts={products} categories={categories} />
      </Suspense>
      <Footer />
    </div>
  );
}
