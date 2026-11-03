"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { cdnImage } from "@/lib/image";

interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
  count: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load categories");
        setCategories(data.categories);
      })
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-unbounded font-black text-2xl md:text-3xl text-white tracking-tight uppercase">
            CATEGORIES
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Categories shown on the SwagCentral homepage, with live product counts.
          </p>
        </div>

        <Link
          href="/admin/import"
          className="bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-unbounded font-bold px-4 py-2.5 rounded-xl transition uppercase w-max"
        >
          Import from WordPress
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 text-red-300 border border-red-800 rounded-xl text-xs">{error}</div>
      )}

      {!categories && !error && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#ff5500]" />
        </div>
      )}

      {categories && categories.length === 0 && (
        <p className="text-xs text-gray-400">No categories yet. Import products to create them.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(categories || []).map((cat) => (
          <Link
            key={cat._id}
            href={`/shop?category=${cat.slug}`}
            target="_blank"
            className="bg-[#131b2e] border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-700 transition"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#ff5500]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdnImage(cat.image, 160)} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <h3 className="font-unbounded font-bold text-sm text-white leading-snug">{cat.name}</h3>
              <p className="text-[11px] text-gray-400">Slug: {cat.slug}</p>
              <span className="text-xs text-emerald-400 font-semibold inline-block">
                {cat.count} {cat.count === 1 ? "Product" : "Products"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
