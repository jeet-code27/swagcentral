"use client";

import React, { useState } from "react";
import { PRODUCTS as DEFAULT_PRODUCTS } from "@/data/mockData";
import ProductCard from "./ProductCard";
import ProductQuickViewModal from "./ProductQuickViewModal";

interface ProductShowcaseTabsProps {
  products?: any[];
  categoryFilter?: string;
}

export default function ProductShowcaseTabs({
  products = DEFAULT_PRODUCTS,
  categoryFilter,
}: ProductShowcaseTabsProps) {
  const [activeTab, setActiveTab] = useState<"new" | "bestseller" | "sale">("new");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const productList = products && products.length > 0 ? products : DEFAULT_PRODUCTS;

  const tabs = [
    { id: "new", label: "NEW ARRIVALS" },
    { id: "bestseller", label: "BEST SELLERS" },
    { id: "sale", label: "ON SALE" },
  ];

  // Filter products by tab and optional category filter
  const filteredProducts = productList.filter((product) => {
    if (categoryFilter && product.category !== categoryFilter) {
      return false;
    }
    if (activeTab === "new") return product.isNewArrival || product.badge?.includes("NEW");
    if (activeTab === "bestseller") return product.isBestSeller;
    if (activeTab === "sale") return product.isOnSale;
    return true;
  });

  return (
    <section id="products-section" className="w-full py-12 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 mb-8 gap-4">
          <div className="flex items-center gap-6 md:gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`font-unbounded font-black text-sm md:text-base tracking-wide uppercase transition-colors relative py-1 focus:outline-none ${
                  activeTab === tab.id
                    ? "text-gray-950"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff5500] rounded-full -mb-4"></span>
                )}
              </button>
            ))}
          </div>

          {categoryFilter && (
            <span className="text-xs font-bold bg-[#ff5500]/10 text-[#ff5500] px-3 py-1 rounded-full uppercase">
              Filtered: {categoryFilter}
            </span>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.slice(0, 10).map((product) => (
              <ProductCard
                key={product._id || product.slug}
                product={product}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No products found in this tab. Select another tab or category.
          </div>
        )}

        {/* Quick View Modal */}
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
