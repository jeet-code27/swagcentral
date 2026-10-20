"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  Check,
  ShieldCheck,
  Zap,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Headphones,
  Sparkles,
  Lock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import { formatProductDescription, formatShortDescription } from "@/lib/formatter";

interface ProductDetailsClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: ProductDetailsClientProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [activeTab, setActiveTab] = useState<"description" | "features" | "license">("description");
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product._id || product.slug,
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

  const handleBuyNow = () => {
    addToCart({
      id: product._id || product.slug,
      slug: product.slug,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      thumbnail: product.thumbnail,
      category: product.category,
      deliveryType: product.deliveryType || "both",
    });
    setIsCartOpen(true);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12 w-full">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-semibold overflow-x-auto pb-1">
        <Link href="/" className="hover:text-[#ff5500] transition">
          Home
        </Link>
        <ChevronRight size={13} className="text-gray-400" />
        <Link href="/shop" className="hover:text-[#ff5500] transition">
          Shop
        </Link>
        <ChevronRight size={13} className="text-gray-400" />
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:text-[#ff5500] transition uppercase"
        >
          {product.categoryName || product.category}
        </Link>
        <ChevronRight size={13} className="text-gray-400" />
        <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 md:p-10 border border-gray-200/80 shadow-sm">
        {/* Left Column: Image Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-gray-100 shadow-lg group flex items-center justify-center">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />

            {product.badge && (
              <span className="absolute top-4 left-4 bg-[#ff5500] text-white text-xs font-unbounded font-black px-3 py-1 rounded shadow-lg uppercase tracking-wider">
                {product.badge}
              </span>
            )}
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-xs text-gray-700">
              <Zap size={16} className="text-[#ff5500]" />
              <span className="font-semibold">Instant Access</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-xs text-gray-700">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span className="font-semibold">Lifetime License</span>
            </div>
          </div>
        </div>

        {/* Right Column: Product Details & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/shop?category=${product.category}`}
                className="text-xs font-bold text-[#ff5500] bg-[#ff5500]/10 px-3 py-1 rounded-full uppercase tracking-wider hover:underline"
              >
                {product.categoryName || product.category}
              </Link>
              {product.focusKeyword && (
                <span className="text-[11px] text-gray-400 font-medium">
                  • {product.focusKeyword}
                </span>
              )}
            </div>

            <h1 className="font-unbounded font-black text-2xl sm:text-3xl text-gray-950 leading-tight">
              {product.title}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-semibold">
                5.0 ({product.reviewCount || 48} verified customer ratings)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 bg-gradient-to-r from-orange-50/50 to-amber-50/30 rounded-2xl border border-orange-200/60 space-y-2">
            <div className="flex items-baseline gap-4">
              <span className="font-unbounded font-black text-3xl sm:text-4xl text-[#ff5500] tracking-tight">
                ₹{product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-gray-400 line-through">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-unbounded font-bold px-2.5 py-1 rounded-md shadow-sm">
                  Save {product.discountPercentage}%
                </span>
              )}
            </div>
            <p className="text-xs text-amber-900 font-medium">
              Tax included. Instant download link provided right after payment.
            </p>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-sm text-gray-600 leading-relaxed font-normal">
              {formatShortDescription(product.shortDescription)}
            </p>
          )}

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#ff5500] hover:bg-[#e04b00] text-white font-unbounded font-bold py-4 px-8 rounded-xl shadow-xl transition transform active:scale-98 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                <span>Instant Buy Now</span>
                <Zap size={16} />
              </button>

              <button
                onClick={handleAddToCart}
                className={`py-4 px-6 rounded-xl font-unbounded font-bold text-xs uppercase tracking-wider transition border flex items-center justify-center gap-2 ${
                  added
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-gray-900 hover:bg-black text-white border-gray-900"
                }`}
              >
                {added ? (
                  <>
                    <Check size={16} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Safe Delivery Note */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-[11px] text-gray-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock size={13} className="text-emerald-600" />
                Dispatched automatically to your email & visible on-screen.
              </span>
              <a
                href="https://wa.me/919821774565"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff5500] hover:underline font-bold flex items-center gap-1"
              >
                <Headphones size={12} />
                <span>Need Help?</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Features, License */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-4 sm:gap-8 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab("description")}
            className={`font-unbounded font-black text-xs sm:text-sm tracking-wider uppercase transition relative py-1 focus:outline-none ${
              activeTab === "description"
                ? "text-gray-950"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Product Overview
            {activeTab === "description" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff5500] rounded-full -mb-3"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("features")}
            className={`font-unbounded font-black text-xs sm:text-sm tracking-wider uppercase transition relative py-1 focus:outline-none ${
              activeTab === "features"
                ? "text-gray-950"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Key Highlights
            {activeTab === "features" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff5500] rounded-full -mb-3"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("license")}
            className={`font-unbounded font-black text-xs sm:text-sm tracking-wider uppercase transition relative py-1 focus:outline-none ${
              activeTab === "license"
                ? "text-gray-950"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            License & Delivery
            {activeTab === "license" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff5500] rounded-full -mb-3"></span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-2 text-sm text-gray-700 leading-relaxed">
          {activeTab === "description" && (
            <div
              className="product-description-content"
              dangerouslySetInnerHTML={{ __html: formatProductDescription(product.description) }}
            />
          )}

          {activeTab === "features" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(product.features && product.features.length > 0
                ? product.features
                : [
                    "Complete Unrestricted Master Resell Rights",
                    "Ready-to-use digital assets and resources",
                    "High-speed Google Drive download speed",
                    "Lifetime access with all future updates",
                    "Compatible with mobile, tablet and desktop",
                    "Dedicated customer support on WhatsApp",
                  ]
              ).map((feat: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Check size={16} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-800">{feat}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "license" && (
            <div className="space-y-4 text-xs text-gray-600">
              <h4 className="font-unbounded font-bold text-sm text-gray-900 uppercase">
                Digital Delivery & License Terms:
              </h4>
              <p>
                Once your payment is confirmed, you will immediately see your access link on the screen, and our system will also dispatch a direct access email with invoice to your registered email address.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>You get complete rights to use, learn from, and rebrand this content.</li>
                <li>No monthly recurring charges — one-time purchase with lifetime access.</li>
                <li>For any help with links or downloading files, WhatsApp us directly at +91 9821774565.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-unbounded font-black text-xl text-gray-950 uppercase tracking-tight">
              Related Digital Bundles
            </h3>
            <Link
              href={`/shop?category=${product.category}`}
              className="text-xs font-unbounded font-bold text-[#ff5500] hover:underline"
            >
              View More in Category
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id || p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
