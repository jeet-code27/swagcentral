"use client";

import React from "react";
import Link from "next/link";
import { CATEGORIES as DEFAULT_CATEGORIES } from "@/data/mockData";
import SwipeableContainer from "@/components/SwipeableContainer";
import { cdnImage } from "@/lib/image";

interface ShopByCategoryProps {
  categories?: any[];
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
}

export default function ShopByCategory({
  categories = DEFAULT_CATEGORIES,
  selectedCategory,
  onSelectCategory,
}: ShopByCategoryProps) {
  const list = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <section id="categories-section" className="w-full py-12 md:py-16 px-4 md:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="font-unbounded font-black text-2xl md:text-3xl text-gray-950 uppercase tracking-tight">
            SHOP BY CATEGORY
          </h2>
          <div className="w-16 h-1 bg-[#ff5500] mx-auto mt-2 rounded-full"></div>
          <p className="text-xs text-gray-400 mt-2 font-medium">
            Swipe left or right to explore verified digital bundles
          </p>
        </div>

        {/* Circular category swipeable row */}
        <SwipeableContainer showArrows={true} showProgressBar={true} className="py-2 px-1 gap-6 md:gap-8">
          {list.map((cat: any) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <Link
                key={cat.slug || cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center flex-shrink-0 w-28 md:w-36 text-center focus:outline-none"
              >
                {/* Circular image badge */}
                <div
                  className={`w-24 h-24 md:w-28 md:h-28 rounded-full p-1 transition-all duration-300 transform group-hover:scale-105 ${
                    isSelected
                      ? "ring-4 ring-[#ff5500] ring-offset-2 shadow-xl"
                      : "ring-2 ring-gray-200 group-hover:ring-[#ff5500] shadow-md group-hover:shadow-xl"
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-900">
                    <img
                      src={cdnImage(cat.image, 400)}
                      loading="lazy"
                      decoding="async"
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                  </div>
                </div>

                {/* Category Name below */}
                <span
                  className={`mt-3 font-unbounded font-bold text-[11px] md:text-xs leading-tight tracking-wider uppercase transition-colors duration-200 line-clamp-2 ${
                    isSelected
                      ? "text-[#ff5500]"
                      : "text-gray-900 group-hover:text-[#ff5500]"
                  }`}
                >
                  {cat.name}
                </span>

                <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  {cat.count || 10}+ Products
                </span>
              </Link>
            );
          })}
        </SwipeableContainer>
      </div>
    </section>
  );
}
