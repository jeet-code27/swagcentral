"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PRODUCTS, ProductItem } from "@/data/mockData";
import {
  Package,
  Plus,
  ExternalLink,
  FileText,
  Zap,
  Trash2,
  Edit,
  Search,
} from "lucide-react";

export default function AdminProductsPage() {
  const [productList, setProductList] = useState<ProductItem[]>(PRODUCTS);
  const [search, setSearch] = useState("");

  const filtered = productList.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-unbounded font-black text-2xl md:text-3xl text-white tracking-tight uppercase">
            DIGITAL PRODUCTS
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your digital assets, pricing, and fulfillment formats (Links & PDFs).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/import"
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-unbounded font-bold px-4 py-2.5 rounded-xl transition uppercase"
          >
            WordPress Bulk Import
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#131b2e] p-4 rounded-xl border border-gray-800 flex items-center justify-between gap-4">
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
        <span className="text-xs font-semibold text-gray-400">
          Total: {filtered.length} products
        </span>
      </div>

      {/* Products Table */}
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
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-4">
                    <img
                      src={prod.thumbnail}
                      alt={prod.title}
                      className="w-12 h-12 rounded-lg object-contain bg-gray-950 border border-gray-800"
                    />
                  </td>
                  <td className="p-4 font-semibold text-white max-w-xs">
                    <div className="truncate">{prod.title}</div>
                    <span className="text-[10px] text-gray-500">ID: {prod.id}</span>
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
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      Active
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/#products-section`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-white transition"
                        title="View on site"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
