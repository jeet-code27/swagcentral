import React, { Suspense } from "react";
import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
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
  await connectDB();

  const [productsDocs, categoriesDocs] = await Promise.all([
    Product.find({ status: "active" }).sort({ createdAt: -1 }).lean(),
    Category.find({}).sort({ orderIndex: 1 }).lean(),
  ]);

  const products = JSON.parse(JSON.stringify(productsDocs));
  const categories = JSON.parse(JSON.stringify(categoriesDocs));

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
      <CartDrawer />
    </div>
  );
}
