"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Zap,
  Search,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Plus,
  Pencil,
  Eye,
} from "lucide-react";
import { cdnImage } from "@/lib/image";
import Pagination, { usePagination } from "@/components/Pagination";

interface AdminProduct {
  _id: string;
  title: string;
  slug: string;
  category: string;
  categoryName?: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  deliveryType: "link" | "pdf" | "both";
  accessUrl?: string;
  pdfFileName?: string;
  status: "active" | "draft";
}

const hasLink = (p: AdminProduct) => !!(p.accessUrl || p.pdfFileName);

export default function AdminProductsPage() {
  const [productList, setProductList] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("missing") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMissingOnly(true);
    }
    fetch("/api/admin/products", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load products");
        setProductList(data.products);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filtered = productList.filter(
    (p) =>
      (!missingOnly || !hasLink(p)) &&
      (p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.categoryName || "").toLowerCase().includes(q))
  );
  const { page, totalPages, pageItems, rangeStart, rangeEnd, setPage } = usePagination(
    filtered,
    20,
    `${search}|${missingOnly}`
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-unbounded font-black text-2xl md:text-3xl text-white tracking-tight uppercase">
            DIGITAL PRODUCTS
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Your live catalog, prices, and whether each product has an access link ready for delivery.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-unbounded font-bold px-4 py-2.5 rounded-xl transition uppercase w-max shadow-lg shadow-[#ff5500]/20"
        >
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#131b2e] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff5500]"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[11px] text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={missingOnly}
              onChange={(e) => setMissingOnly(e.target.checked)}
              className="accent-[#ff5500]"
            />
            Missing access link only
          </label>
          <span className="text-xs font-semibold text-gray-400">
            {filtered.length ? `${rangeStart}–${rangeEnd} of ${filtered.length}` : "0"}
            {filtered.length !== productList.length && ` (filtered from ${productList.length})`}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 text-red-300 border border-red-800 rounded-xl text-xs">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#ff5500]" />
        </div>
      ) : (
        <div className="bg-[#131b2e] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f172a] text-gray-400 font-unbounded uppercase text-[10px]">
                <tr>
                  <th className="p-4">Thumbnail</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Delivery Format</th>
                  <th className="p-4">Access Link</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {pageItems.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-800/30 transition">
                    <td className="p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cdnImage(prod.thumbnail, 120)}
                        alt={prod.title}
                        className="w-12 h-12 rounded-lg object-contain bg-gray-950 border border-gray-800"
                      />
                    </td>
                    <td className="p-4 font-semibold text-white max-w-xs">
                      <Link href={`/admin/products/${prod._id}`} className="block truncate hover:text-[#ff5500]">
                        {prod.title}
                      </Link>
                      <span className="text-[10px] text-gray-500">/{prod.slug}</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[11px] font-medium">
                        {prod.categoryName || prod.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-unbounded font-black text-sm text-[#ff5500]">
                        ₹{prod.price.toFixed(2)}
                      </div>
                      {prod.originalPrice > prod.price && (
                        <span className="text-[10px] text-gray-500 line-through">
                          ₹{prod.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-300">
                        {prod.deliveryType === "pdf" ? (
                          <>
                            <FileText size={12} className="text-amber-400" />
                            <span>PDF File</span>
                          </>
                        ) : prod.deliveryType === "both" ? (
                          <>
                            <Zap size={12} className="text-yellow-400" />
                            <span>Drive + PDF</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink size={12} className="text-cyan-400" />
                            <span>Drive Link</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      {hasLink(prod) ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                          <CheckCircle size={12} /> Added
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                          <AlertTriangle size={12} /> Missing
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {prod.status === "active" ? (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-500/20 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-500/30">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${prod._id}`}
                          className="inline-flex p-1.5 text-gray-400 hover:text-white transition"
                          title="View details"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/admin/products/${prod._id}/edit`}
                          className="inline-flex p-1.5 text-gray-400 hover:text-[#ff5500] transition"
                          title="Edit product"
                        >
                          <Pencil size={15} />
                        </Link>
                        <Link
                          href={`/product/${prod.slug}`}
                          target="_blank"
                          className="inline-flex p-1.5 text-gray-400 hover:text-white transition"
                          title="View in store"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-xs text-gray-400">No products match.</p>
          )}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-800">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} theme="dark" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
