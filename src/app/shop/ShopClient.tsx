"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, SlidersHorizontal, Sparkles, ChevronRight, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SwipeableContainer from "@/components/SwipeableContainer";
import Pagination, { usePagination } from "@/components/Pagination";
import Link from "next/link";

interface ShopClientProps {
  initialProducts: any[];
  categories: any[];
}

export default function ShopClient({
  initialProducts,
  categories,
}: ShopClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "bestseller">("featured");

  // Keep state in sync with URL query
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("all");
    }
  }, [categoryParam]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    const newUrl = slug === "all" ? "/shop" : `/shop?category=${encodeURIComponent(slug)}`;
    window.history.pushState(null, "", newUrl);
  };

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Category filter
        if (selectedCategory !== "all" && p.category !== selectedCategory) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = (p.shortDescription || "").toLowerCase().includes(q);
          const matchCat = (p.categoryName || "").toLowerCase().includes(q);
          const matchKw = (p.focusKeyword || "").toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat && !matchKw) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "bestseller") return (b.salesCount || 0) - (a.salesCount || 0);
        return 0; // featured / default
      });
  }, [initialProducts, selectedCategory, searchQuery, sortBy]);

  const { page, totalPages, pageItems, rangeStart, rangeEnd, setPage } = usePagination(
    filteredProducts,
    24,
    `${selectedCategory}|${searchQuery}|${sortBy}`
  );

  const goToPage = (p: number) => {
    setPage(p);
    document.getElementById("shop-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 w-full flex-1">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
        <Link href="/" className="hover:text-[#ff5500] transition">
          Home
        </Link>
        <ChevronRight size={13} className="text-gray-400" />
        <span className="text-gray-900 font-bold">Shop</span>
        {selectedCategory !== "all" && (
          <>
            <ChevronRight size={13} className="text-gray-400" />
            <span className="text-[#ff5500] uppercase font-bold">
              {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
            </span>
          </>
        )}
      </nav>

      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-[#0d1117] via-[#1a2333] to-[#0a0f1d] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden border border-gray-800 shadow-xl">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#ff5500]/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-[#ff5500]/30">
            <Sparkles size={14} className="text-yellow-400" />
            <span>59+ Verified Digital Bundles</span>
          </div>

          <h1 className="font-unbounded font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white uppercase leading-tight">
            DIGITAL STORE
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Instant digital access to prompts, Canva kits, study notes, recipes, and ready-to-sell PLR vaults.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, prompt, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff5500] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 whitespace-nowrap">
              <SlidersHorizontal size={14} />
              <span>Sort By:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#ff5500]"
            >
              <option value="featured">Featured Deals</option>
              <option value="bestseller">Best Selling</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills with SwipeableContainer */}
        <div className="border-t border-gray-100 pt-3">
          <SwipeableContainer showArrows={true} showProgressBar={true} className="gap-2 py-1">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-4 py-2 rounded-xl text-xs font-unbounded font-bold transition uppercase whitespace-nowrap flex-shrink-0 ${
                selectedCategory === "all"
                  ? "bg-[#ff5500] text-white shadow-md shadow-[#ff5500]/25"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Products ({initialProducts.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-unbounded font-bold transition uppercase whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat.slug
                    ? "bg-[#ff5500] text-white shadow-md shadow-[#ff5500]/25"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </SwipeableContainer>
        </div>
      </div>

      {/* Products Counter */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
        <span>
          {filteredProducts.length > 0 ? (
            <>
              Showing <strong>{rangeStart}–{rangeEnd}</strong> of <strong>{filteredProducts.length}</strong> digital
              products
            </>
          ) : (
            <>No products</>
          )}
        </span>
        {selectedCategory !== "all" && (
          <button
            onClick={() => handleCategoryChange("all")}
            className="text-[#ff5500] hover:underline font-bold"
          >
            Clear category filter
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-10">
          <div id="shop-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 scroll-mt-28">
            {pageItems.map((p) => (
              <ProductCard key={p._id || p.slug} product={p} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/80 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#ff5500] flex items-center justify-center mx-auto">
            <Filter size={24} />
          </div>
          <h3 className="font-unbounded font-bold text-lg text-gray-900">
            No products found matching your filter
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try resetting your search query or selecting another category from the list above.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="bg-[#ff5500] text-white font-unbounded font-bold text-xs px-6 py-2.5 rounded-xl uppercase tracking-wider"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </main>
  );
}
