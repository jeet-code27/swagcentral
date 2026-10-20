"use client";

import React from "react";
import { CATEGORIES } from "@/data/mockData";
import { Layers, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-unbounded font-black text-2xl md:text-3xl text-white tracking-tight uppercase">
            CATEGORIES
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Circular badge categories displayed on SwagCentral homepage.
          </p>
        </div>

        <Link
          href="/admin/import"
          className="bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-unbounded font-bold px-4 py-2.5 rounded-xl transition uppercase"
        >
          Import from WordPress
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#131b2e] border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-700 transition"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#ff5500]">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-unbounded font-bold text-sm text-white leading-snug">
                {cat.name}
              </h3>
              <p className="text-[11px] text-gray-400">Slug: {cat.slug}</p>
              <span className="text-xs text-emerald-400 font-semibold inline-block">
                {cat.count}+ Products
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
