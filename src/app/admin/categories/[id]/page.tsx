"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle, ExternalLink, Pencil } from "lucide-react";
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

interface CategoryDetail {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryProduct {
  _id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  status: "active" | "draft";
  accessUrl?: string;
  pdfFileName?: string;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function CategoryViewPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/categories/${id}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load category");
        setCategory(data.category);
        setProducts(data.products);
      })
      .catch((err) => setError((err as Error).message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!category) return <LoadingState />;

  const activeCount = products.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/categories"
        backLabel="All categories"
        title={category.name}
        subtitle={`/${category.slug}`}
        actions={
          <>
            <Link href={`/shop?category=${category.slug}`} target="_blank" className={secondaryButton}>
              <ExternalLink size={14} /> View in Store
            </Link>
            <Link href={`/admin/categories/${category._id}/edit`} className={primaryButton}>
              <Pencil size={14} /> Edit Category
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-1">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#ff5500] bg-neutral-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cdnImage(category.image, 300)} alt={category.name} className="w-full h-full object-cover" />
          </div>
          <dl>
            <DetailRow label="Products">
              {products.length} total · {activeCount} active
            </DetailRow>
            <DetailRow label="Display Order">{category.orderIndex}</DetailRow>
            <DetailRow label="Description">
              {category.description || <span className="text-gray-500">Not set</span>}
            </DetailRow>
            <DetailRow label="Created">{formatDate(category.createdAt)}</DetailRow>
            <DetailRow label="Last Updated">{formatDate(category.updatedAt)}</DetailRow>
          </dl>
        </Card>

        <Card title={`Products in this category (${products.length})`} className="lg:col-span-2">
          {products.length === 0 ? (
            <p className="text-xs text-gray-400">No products yet.</p>
          ) : (
            <ul className="divide-y divide-gray-800/70">
              {products.map((p) => (
                <li key={p._id}>
                  <Link
                    href={`/admin/products/${p._id}`}
                    className="flex items-center gap-3 py-3 hover:bg-gray-800/30 rounded-lg px-2 -mx-2 transition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cdnImage(p.thumbnail, 100)}
                      alt=""
                      className="w-11 h-11 rounded-lg object-contain bg-neutral-950 border border-gray-800 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{p.title}</div>
                      <div className="text-[11px] text-gray-400">
                        ₹{p.price}
                        {p.status === "draft" && <span className="ml-2 text-gray-500">· Draft</span>}
                      </div>
                    </div>
                    {p.accessUrl || p.pdfFileName ? (
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" aria-label="Access link added" />
                    ) : (
                      <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" aria-label="Access link missing" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
