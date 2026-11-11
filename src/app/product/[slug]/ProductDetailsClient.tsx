"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { cdnImage } from "@/lib/image";
import { formatPrice } from "@/lib/price";

interface ProductDetailsClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const router = useRouter();
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
    }, { silent: true });
    router.push("/checkout");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12 w-full overflow-x-hidden">
      {/* Breadcrumbs: one line on every screen; the product name only shows from tablet up */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500 font-semibold min-w-0">
        <Link href="/" className="hover:text-[#ff5500] transition flex-shrink-0">
          Home
        </Link>
        <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
        <Link href="/shop" className="hover:text-[#ff5500] transition flex-shrink-0">
          Shop
        </Link>
        <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:text-[#ff5500] transition uppercase truncate min-w-0"
        >
          {product.categoryName || product.category}
        </Link>
        <ChevronRight size={13} className="text-gray-400 flex-shrink-0 hidden sm:block" />
        <span className="text-gray-900 truncate min-w-0 hidden sm:block">{product.title}</span>
      </nav>

      {/* Main Product Showcase Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 bg-white rounded-3xl p-4 sm:p-6 md:p-10 border border-gray-200/80 shadow-sm">
        {/* Left Column: Image Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-gray-100 shadow-lg group flex items-center justify-center">
            <img
              src={cdnImage(product.thumbnail, 900)}
              fetchPriority="high"
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
          <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
            <div className="p-2.5 sm:p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-[11px] sm:text-xs text-gray-700 min-w-0">
              <Zap size={16} className="text-[#ff5500] flex-shrink-0" />
              <span className="font-semibold leading-tight">Delivered by Email</span>
            </div>
            <div className="p-2.5 sm:p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-[11px] sm:text-xs text-gray-700 min-w-0">
              <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
              <span className="font-semibold leading-tight">Lifetime Access</span>
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

            {/* Ratings (only when the product actually has ratings) */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={i < Math.round(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-semibold">
                  {Number(product.rating || 0).toFixed(1)} ({product.reviewCount} ratings)
                </span>
              </div>
            )}
          </div>

          {/* Pricing Box */}
          <div className="p-5 bg-gradient-to-r from-orange-50/50 to-amber-50/30 rounded-2xl border border-orange-200/60 space-y-2">
            <div className="flex items-baseline gap-4">
              <span className="font-unbounded font-black text-3xl sm:text-4xl text-[#ff5500] tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-unbounded font-bold px-2.5 py-1 rounded-md shadow-sm">
                  Save {product.discountPercentage}%
                </span>
              )}
            </div>
            <p className="text-xs text-amber-900 font-medium">
              Tax included. Download links are emailed to you within 12 hours of payment.
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
                <span>Buy Now</span>
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
                Download links emailed to you within 12 hours of payment.
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
      <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-10 border border-gray-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-5 sm:gap-8 border-b border-gray-200 pb-3 overflow-x-auto [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab("description")}
            className={`font-unbounded font-black text-[11px] sm:text-sm tracking-wider uppercase transition relative py-1 focus:outline-none whitespace-nowrap flex-shrink-0 ${
              activeTab === "description"
                ? "text-gray-950"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <span className="sm:hidden">Overview</span>
            <span className="hidden sm:inline">Product Overview</span>
            {activeTab === "description" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff5500] rounded-full -mb-3"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("features")}
            className={`font-unbounded font-black text-[11px] sm:text-sm tracking-wider uppercase transition relative py-1 focus:outline-none whitespace-nowrap flex-shrink-0 ${
              activeTab === "features"
                ? "text-gray-950"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <span className="sm:hidden">Highlights</span>
            <span className="hidden sm:inline">Key Highlights</span>
            {activeTab === "features" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff5500] rounded-full -mb-3"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("license")}
            className={`font-unbounded font-black text-[11px] sm:text-sm tracking-wider uppercase transition relative py-1 focus:outline-none whitespace-nowrap flex-shrink-0 ${
              activeTab === "license"
                ? "text-gray-950"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <span className="sm:hidden">Delivery</span>
            <span className="hidden sm:inline">License & Delivery</span>
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
                    "Ready-to-use digital files",
                    "Download links delivered by email within 12 hours",
                    "One-time payment, lifetime access",
                    "Works on mobile, tablet and desktop",
                    "Support on WhatsApp",
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
            <div className="space-y-5 text-sm text-gray-700">
              <div className="space-y-2">
                <h4 className="font-unbounded font-bold text-sm text-gray-900 uppercase">How delivery works</h4>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>Pay securely with UPI, card, net banking or wallet.</li>
                  <li>You get an order confirmation email right away.</li>
                  <li>
                    Your download links are emailed to you within 12 hours. They also appear in{" "}
                    <Link href="/account" className="text-[#ff5500] font-semibold">
                      My Orders
                    </Link>
                    .
                  </li>
                </ol>
              </div>
              <div className="space-y-2">
                <h4 className="font-unbounded font-bold text-sm text-gray-900 uppercase">License</h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>One-time payment with lifetime access to your files. No subscription.</li>
                  <li>For your own personal or business use.</li>
                  <li>Resell or rebrand only if this product says it includes resell / PLR rights.</li>
                </ul>
                <p className="text-xs text-gray-500">
                  Full details:{" "}
                  <Link href="/terms" className="text-[#ff5500] font-semibold">
                    Terms
                  </Link>{" "}
                  ·{" "}
                  <Link href="/refund-policy" className="text-[#ff5500] font-semibold">
                    Refund Policy
                  </Link>
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Need help with a link or download? WhatsApp us at{" "}
                <a href="https://wa.me/919821774565" className="text-[#ff5500] font-semibold">
                  +91 9821774565
                </a>
                .
              </p>
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
