"use client";

import React, { useState } from "react";
import { PRODUCTS as DEFAULT_PRODUCTS } from "@/data/mockData";
import ProductCard from "./ProductCard";
import ProductQuickViewModal from "./ProductQuickViewModal";
import { TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TrendingProductsProps {
  products?: any[];
}

export default function TrendingProducts({
  products = DEFAULT_PRODUCTS,
}: TrendingProductsProps) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const productList = products && products.length > 0 ? products : DEFAULT_PRODUCTS;
  const trendingList = productList.filter((p) => p.isTrending || p.isFeatured).slice(0, 10);

  return (
    <section className="w-full py-12 px-4 md:px-8 bg-[#fdfbf7]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-[#ff5500]" size={24} />
            <h2 className="font-unbounded font-black text-xl md:text-2xl text-gray-950 uppercase tracking-tight">
              TRENDING DIGITAL PRODUCTS
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-unbounded font-bold text-[#ff5500] hover:underline flex items-center gap-1"
          >
            <span>VIEW ALL IN SHOP</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {trendingList.map((product) => (
            <ProductCard
              key={product._id || product.slug}
              product={product}
              onQuickView={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>

        {selectedProduct && (
          <ProductQuickViewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </section>
  );
}
