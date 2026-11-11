import React, { Suspense } from "react";
import { Metadata } from "next";
import { getActiveProducts, getCategoriesWithCounts } from "@/lib/catalog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopClient from "@/app/shop/ShopClient";
import { Loader2 } from "lucide-react";

export const instant = false;

export const metadata: Metadata = {
  title: "Shop Digital Products, AI Prompts & Templates | SwagCentral",
  description:
    "Browse all SwagCentral digital products: AI prompts, Canva templates, reels packs, eBooks, study notes and PLR bundles. Filter by category and search.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Header />
      {/* Page heading in the server HTML (the shop UI below loads with the search box) */}
      <h1 className="sr-only">Shop Digital Products: AI Prompts, Canva Templates, Reels Packs and PLR Bundles</h1>
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
