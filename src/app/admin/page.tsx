"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  ShoppingBag,
  UploadCloud,
  CheckCircle,
  ExternalLink,
  Plus,
  Flame,
} from "lucide-react";
import { PRODUCTS } from "@/data/mockData";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Digital Revenue",
      value: "₹48,950",
      change: "+24% this week",
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Active Products",
      value: `${PRODUCTS.length} Bundles`,
      change: "Across 7 categories",
      icon: Package,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Orders Delivered",
      value: "142 Completed",
      change: "100% instant email dispatch",
      icon: ShoppingBag,
      color: "text-[#ff5500] bg-[#ff5500]/10 border-[#ff5500]/20",
    },
    {
      title: "Media on Cloudinary",
      value: "Synced",
      change: "Auto-optimized CDN",
      icon: UploadCloud,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  const recentOrders = [
    {
      id: "SWAG-1094A",
      customer: "rahul.sharma@gmail.com",
      product: "The Ultimate Claude Bundle",
      amount: "₹499.00",
      status: "Delivered",
      token: "demo-token-1",
    },
    {
      id: "SWAG-1093B",
      customer: "priya.designs@outlook.com",
      product: "Canva Template Mega Pack",
      amount: "₹349.00",
      status: "Delivered",
      token: "demo-token-2",
    },
    {
      id: "SWAG-1092C",
      customer: "vikram99@yahoo.com",
      product: "100,000+ Digital Assets Mega Bundle",
      amount: "₹499.00",
      status: "Delivered",
      token: "demo-token-3",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-unbounded font-black text-2xl md:text-3xl text-white tracking-tight">
            ADMIN DASHBOARD
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage SwagCentral digital catalog, automated deliveries, and WordPress imports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-2 bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-unbounded font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#ff5500]/20 uppercase"
          >
            <UploadCloud size={16} />
            <span>Import From WordPress</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-[#131b2e] border border-gray-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-semibold">{s.title}</span>
                <div className={`p-2 rounded-xl border ${s.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <h3 className="font-unbounded font-black text-2xl text-white">
                  {s.value}
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">{s.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* WordPress & Cloudinary Migration Quick Banner */}
      <div className="bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-gray-900 border border-orange-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-[#ff5500]" />
            <h3 className="font-unbounded font-bold text-sm text-white uppercase">
              WordPress Bulk Importer & Cloudinary Asset Re-Uploader
            </h3>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Export all products from WordPress into XML or CSV. This tool will auto-download WP images, re-host them to Cloudinary CDN, and batch insert products and categories directly into MongoDB.
          </p>
        </div>
        <Link
          href="/admin/import"
          className="bg-white hover:bg-gray-100 text-gray-950 font-unbounded font-bold text-xs px-5 py-2.5 rounded-xl transition uppercase flex-shrink-0"
        >
          Open Importer Tool
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[#131b2e] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-unbounded font-bold text-sm text-white uppercase">
            Recent Orders & Delivery Status
          </h3>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle size={14} /> Instant Access Engine Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f172a] text-gray-400 font-unbounded uppercase text-[10px]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Email</th>
                <th className="p-4">Bundle / Product</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4 text-right">Access Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-4 font-mono font-bold text-[#ff5500]">
                    {ord.id}
                  </td>
                  <td className="p-4">{ord.customer}</td>
                  <td className="p-4 font-semibold text-white">{ord.product}</td>
                  <td className="p-4 font-unbounded font-bold text-white">
                    {ord.amount}
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-500/30">
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/download/${ord.token}`}
                      target="_blank"
                      className="text-xs text-[#ff5500] hover:underline inline-flex items-center gap-1 font-bold"
                    >
                      <span>View Hub</span>
                      <ExternalLink size={12} />
                    </Link>
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
