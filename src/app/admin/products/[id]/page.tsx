"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle, ExternalLink, Pencil, Star } from "lucide-react";
import {
  Card,
  DetailRow,
  ErrorState,
  LoadingState,
  PageHeader,
  primaryButton,
  secondaryButton,
} from "@/components/admin/AdminUI";
import { cdnImage } from "@/lib/image";
import { pdfDisplayName } from "@/lib/pdf";
import { formatProductDescription } from "@/lib/formatter";

interface ProductDetail {
  _id: string;
  title: string;
  slug: string;
  category: string;
  categoryName?: string;
  shortDescription?: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage?: number;
  badge?: string;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  images: string[];
  deliveryType: "link" | "pdf" | "both";
  accessUrl?: string;
  pdfFileName?: string;
  features: string[];
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  isTrending?: boolean;
  status: "active" | "draft";
  wcId?: string;
  createdAt: string;
  updatedAt: string;
}

const DELIVERY_LABELS = { link: "Drive / Canva link", pdf: "PDF file", both: "Link + PDF" };

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function ProductViewPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [stats, setStats] = useState<{ orders: number; delivered: number; revenue: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load product");
        setProduct(data.product);
        setStats(data.stats);
      })
      .catch((err) => setError((err as Error).message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!product) return <LoadingState />;

  const images = [product.thumbnail, ...product.images.filter((u) => u !== product.thumbnail)].filter(Boolean);
  const flags = [
    product.isFeatured && "Featured",
    product.isNewArrival && "New Arrival",
    product.isBestSeller && "Best Seller",
    product.isOnSale && "On Sale",
    product.isTrending && "Trending",
  ].filter(Boolean) as string[];
  const hasLink = !!(product.accessUrl || product.pdfFileName);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/products"
        backLabel="All products"
        title={product.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {product.status === "active" ? (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            ) : (
              <span className="bg-gray-500/20 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-500/30">
                DRAFT
              </span>
            )}
            <span>/{product.slug}</span>
          </span>
        }
        actions={
          <>
            <Link href={`/product/${product.slug}`} target="_blank" className={secondaryButton}>
              <ExternalLink size={14} /> View in Store
            </Link>
            <Link href={`/admin/products/${product._id}/edit`} className={primaryButton}>
              <Pencil size={14} /> Edit Product
            </Link>
          </>
        }
      />

      {!hasLink && (
        <div className="p-4 bg-amber-950/40 border border-amber-700/50 rounded-2xl text-xs text-amber-200 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          No access link yet. Add one with Edit Product so orders for this product can be sent straight away.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cdnImage(images[activeImage], 700)} alt={product.title} className="w-full h-full object-contain" />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((url, i) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 bg-neutral-950 ${
                          i === activeImage ? "border-[#ff5500]" : "border-gray-800"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cdnImage(url, 120)} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <span className="font-unbounded font-black text-3xl text-[#ff5500]">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                      <span className="text-xs text-emerald-400 font-bold">{product.discountPercentage}% off</span>
                    </>
                  )}
                </div>
                {product.badge && (
                  <span className="inline-block bg-[#ff5500] text-white text-[10px] font-unbounded font-black px-2 py-0.5 rounded uppercase">
                    {product.badge}
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {product.rating} · {product.reviewCount} reviews
                </div>
                {product.shortDescription && (
                  <p className="text-xs text-gray-300 leading-relaxed">{product.shortDescription}</p>
                )}
                {flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {flags.map((f) => (
                      <span key={f} className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card title="Description">
            <div
              className="product-description-admin text-xs text-gray-300 leading-relaxed space-y-3 [&_h2]:text-white [&_h3]:text-white [&_h2]:font-bold [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#ff5500]"
              dangerouslySetInnerHTML={{ __html: formatProductDescription(product.description) }}
            />
          </Card>

          {product.features.length > 0 && (
            <Card title="Features">
              <ul className="space-y-1.5">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <CheckCircle size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          {stats && (
            <Card title="Sales">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ["Orders", stats.orders],
                  ["Delivered", stats.delivered],
                  ["Revenue", `₹${stats.revenue.toLocaleString("en-IN")}`],
                ].map(([label, value]) => (
                  <div key={label as string} className="bg-[#0a0f1d] rounded-xl py-3 border border-gray-800">
                    <div className="font-unbounded font-black text-sm text-white">{value}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="Delivery">
            <dl>
              <DetailRow label="Format">{DELIVERY_LABELS[product.deliveryType]}</DetailRow>
              <DetailRow label="Access Link">
                {product.accessUrl ? (
                  <a href={product.accessUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                    {product.accessUrl}
                  </a>
                ) : (
                  <span className="text-amber-400">Not added</span>
                )}
              </DetailRow>
              <DetailRow label="PDF File">{product.pdfFileName ? pdfDisplayName(product.pdfFileName) : <span className="text-gray-500">None</span>}</DetailRow>
            </dl>
          </Card>

          <Card title="Details">
            <dl>
              <DetailRow label="Category">
                <Link href={`/admin/categories`} className="hover:text-[#ff5500]">
                  {product.categoryName || product.category}
                </Link>
              </DetailRow>
              <DetailRow label="Created">{formatDate(product.createdAt)}</DetailRow>
              <DetailRow label="Last Updated">{formatDate(product.updatedAt)}</DetailRow>
              {product.wcId && <DetailRow label="WooCommerce ID">{product.wcId}</DetailRow>}
            </dl>
          </Card>

          <Card title="SEO">
            <dl>
              <DetailRow label="Meta Title">{product.metaTitle || <span className="text-gray-500">Uses product title</span>}</DetailRow>
              <DetailRow label="Meta Description">{product.metaDescription || <span className="text-gray-500">Not set</span>}</DetailRow>
              <DetailRow label="Focus Keyword">{product.focusKeyword || <span className="text-gray-500">Not set</span>}</DetailRow>
              <DetailRow label="Tags">{product.tags.length ? product.tags.join(", ") : <span className="text-gray-500">None</span>}</DetailRow>
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}
