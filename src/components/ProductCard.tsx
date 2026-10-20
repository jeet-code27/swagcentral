"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Check, ExternalLink, FileText, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: any;
  onQuickView?: (product: any) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart, cart } = useCart();
  const [added, setAdded] = useState(false);

  const productId = product._id || product.id || product.slug;
  const isInCart = cart.some((item) => item.id === productId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: productId,
      slug: product.slug,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      thumbnail: product.thumbnail,
      category: product.category,
      deliveryType: product.deliveryType || "both",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative">
      {/* Top Media Container linked to single product page */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative w-full aspect-square bg-neutral-950 overflow-hidden flex items-center justify-center"
      >
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="bg-[#ff5500] text-white text-[10px] font-unbounded font-black px-2 py-0.5 rounded shadow uppercase tracking-wider">
              {product.badge}
            </span>
          )}
          {product.discountPercentage && product.discountPercentage > 0 && !product.badge?.includes("%") && (
            <span className="bg-emerald-600 text-white text-[10px] font-unbounded font-bold px-2 py-0.5 rounded shadow">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        {/* Digital Asset Delivery Format indicator */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="bg-black/75 backdrop-blur-md text-gray-200 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
            <Zap size={11} className="text-yellow-400" />
            <span>Instant Access</span>
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category */}
          <Link
            href={`/shop?category=${product.category}`}
            className="text-[11px] font-bold text-gray-400 hover:text-[#ff5500] uppercase tracking-wider block truncate"
          >
            {product.categoryName || product.category}
          </Link>

          {/* Title linking to product page */}
          <Link
            href={`/product/${product.slug}`}
            className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#ff5500] transition line-clamp-2 mt-1 leading-snug block"
          >
            {product.title}
          </Link>
        </div>

        {/* Star Ratings */}
        <div className="flex items-center gap-1">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 font-semibold ml-1">
            ({product.reviewCount || 42})
          </span>
        </div>

        {/* Pricing & Add to cart button */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-gray-400 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="font-unbounded font-black text-base sm:text-lg text-[#ff5500] tracking-tight">
              ₹{product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${
              isInCart
                ? "bg-emerald-600 text-white"
                : added
                ? "bg-gray-900 text-white scale-105"
                : "bg-gray-900 hover:bg-[#ff5500] text-white"
            }`}
            title="Add to cart"
            aria-label="Add to cart"
          >
            {isInCart || added ? <Check size={16} /> : <ShoppingBag size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
