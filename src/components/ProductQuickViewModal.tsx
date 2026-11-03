"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X, Check, ShieldCheck, Zap, FileText, ExternalLink, Star } from "lucide-react";
import { ProductItem } from "@/data/mockData";
import { useCart } from "@/context/CartContext";
import { cdnImage } from "@/lib/image";

function toPlainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\\[rn]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface ProductQuickViewModalProps {
  product: ProductItem & { _id?: string; shortDescription?: string };
  onClose: () => void;
}

export default function ProductQuickViewModal({
  product,
  onClose,
}: ProductQuickViewModalProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleInstantBuy = () => {
    addToCart({
      id: product._id || product.id || product.slug,
      slug: product.slug,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      thumbnail: product.thumbnail,
      category: product.category,
      deliveryType: product.deliveryType,
    }, { silent: true });
    onClose();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-black bg-gray-100 rounded-full transition"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Image preview */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 shadow-md flex items-center justify-center">
              <img
                src={cdnImage(product.thumbnail, 700)}
                alt={product.title}
                className="w-full h-full object-contain"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 bg-[#ff5500] text-white text-xs font-unbounded font-black px-2.5 py-1 rounded shadow">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {product.categoryName}
              </span>
              <h3 className="font-unbounded font-bold text-lg text-gray-900 leading-snug">
                {product.title}
              </h3>

              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-semibold">
                  5.0 ({product.reviewCount} verified downloads)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="font-unbounded font-black text-2xl text-[#ff5500]">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Save {product.discountPercentage}%
                  </span>
                )}
              </div>

              {/* Delivery method indicator */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Zap size={14} className="text-[#ff5500]" />
                  <span>Instant Delivery via Email & On-Screen Link</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  {product.deliveryType === "pdf"
                    ? "Includes direct PDF download attachment and high-speed cloud link."
                    : product.deliveryType === "both"
                    ? "Includes Google Drive access link + printable PDF guide."
                    : "Direct Google Drive / Notion / Canva editable template link."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleInstantBuy}
                  className="w-full bg-[#ff5500] hover:bg-[#e04b00] text-white font-unbounded font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition active:scale-98 text-sm uppercase tracking-wider"
                >
                  Buy Now & Get Instant Access
                </button>
              </div>
            </div>
          </div>

          {/* Description & Features */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div>
              <h4 className="font-unbounded font-bold text-sm text-gray-900 uppercase mb-2">
                Product Description
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {toPlainText(product.shortDescription || product.description || "").slice(0, 400)}
              </p>
            </div>

            {product.features && product.features.length > 0 && (
              <div>
                <h4 className="font-unbounded font-bold text-sm text-gray-900 uppercase mb-2">
                  What&apos;s Included In This Bundle
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
