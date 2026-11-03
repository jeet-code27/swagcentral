"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Package,
  ShoppingBag,
  ExternalLink,
  Plus,
  Layers,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface Stats {
  revenue: number;
  revenueThisWeek: number;
  pendingOrders: number;
  pendingValue: number;
  deliveredOrders: number;
  productCount: number;
  productsWithoutLink: number;
  categoryCount: number;
}

interface RecentOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: { title: string }[];
  totalAmount: number;
  orderStatus?: "pending" | "delivered" | "cancelled";
  downloadToken: string;
  createdAt: string;
}

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const STATUS_STYLES = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load dashboard");
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      })
      .catch((err) => setError((err as Error).message));
  }, []);

  const cards = stats
    ? [
        {
          title: "Revenue (Delivered)",
          value: formatINR(stats.revenue),
          change: `${formatINR(stats.revenueThisWeek)} in the last 7 days`,
          icon: IndianRupee,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          href: "/admin/orders",
        },
        {
          title: "Pending Orders",
          value: `${stats.pendingOrders}`,
          change: `${formatINR(stats.pendingValue)} waiting to be sent`,
          icon: Clock,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          href: "/admin/orders",
        },
        {
          title: "Orders Delivered",
          value: `${stats.deliveredOrders}`,
          change: "Products emailed to customers",
          icon: ShoppingBag,
          color: "text-[#ff5500] bg-[#ff5500]/10 border-[#ff5500]/20",
          href: "/admin/orders",
        },
        {
          title: "Active Products",
          value: `${stats.productCount}`,
          change: `Across ${stats.categoryCount} categories`,
          icon: Package,
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
          href: "/admin/products",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-unbounded font-black text-2xl md:text-3xl text-white tracking-tight">
            ADMIN DASHBOARD
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your SwagCentral catalog, categories, and order deliveries.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-unbounded font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#ff5500]/20 uppercase w-max"
        >
          <ShoppingBag size={16} />
          <span>Manage Orders</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 text-red-300 border border-red-800 rounded-xl text-xs">{error}</div>
      )}

      {!stats && !error ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#ff5500]" />
        </div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.title}
                  href={s.href}
                  className="bg-[#131b2e] border border-gray-800 hover:border-gray-700 rounded-2xl p-5 space-y-3 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-semibold">{s.title}</span>
                    <div className={`p-2 rounded-xl border ${s.color}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-unbounded font-black text-2xl text-white">{s.value}</h3>
                    <p className="text-[11px] text-gray-400 mt-1">{s.change}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {stats.productsWithoutLink > 0 && (
            <div className="p-4 bg-amber-950/40 border border-amber-700/50 rounded-2xl text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
                {stats.productsWithoutLink} of {stats.productCount} active products have no access link yet.
                You&apos;ll need to add the link when sending their orders.
              </span>
              <Link href="/admin/products?missing=1" className="font-bold text-amber-300 hover:underline whitespace-nowrap">
                View products
              </Link>
            </div>
          )}

          {/* Recent Orders Table */}
          <div className="bg-[#131b2e] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-unbounded font-bold text-sm text-white uppercase">Recent Orders</h3>
              <Link href="/admin/orders" className="text-xs text-[#ff5500] hover:underline font-bold">
                View all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="p-8 text-center text-xs text-gray-400">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f172a] text-gray-400 font-unbounded uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Products</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Customer Page</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-gray-300">
                    {recentOrders.map((ord) => {
                      const status = ord.orderStatus || "pending";
                      return (
                        <tr key={ord.orderId} className="hover:bg-gray-800/30 transition">
                          <td className="p-4">
                            <Link href={`/admin/orders/${ord.orderId}`} className="font-mono font-bold text-[#ff5500] hover:underline">
                              {ord.orderId}
                            </Link>
                            <span className="text-[10px] text-gray-500">
                              {new Date(ord.createdAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-white font-semibold">{ord.customerName}</div>
                            <div className="text-[11px] text-gray-400">{ord.customerEmail}</div>
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="truncate text-gray-200">
                              {ord.items.map((i) => i.title).join(", ")}
                            </div>
                          </td>
                          <td className="p-4 font-unbounded font-bold text-white">{formatINR(ord.totalAmount)}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${STATUS_STYLES[status]}`}>
                              {status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Link
                              href={`/download/${ord.downloadToken}`}
                              target="_blank"
                              className="text-xs text-[#ff5500] hover:underline inline-flex items-center gap-1 font-bold"
                            >
                              <span>View</span>
                              <ExternalLink size={12} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/admin/products/new", label: "Add New Product", icon: Plus },
          { href: "/admin/products", label: "Edit Products", icon: Package },
          { href: "/admin/categories", label: "Edit Categories", icon: Layers },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-[#131b2e] border border-gray-800 hover:border-[#ff5500]/50 rounded-2xl p-5 flex items-center gap-3 text-sm font-unbounded font-bold text-white uppercase transition"
          >
            <span className="p-2 rounded-xl bg-[#ff5500]/10 text-[#ff5500] border border-[#ff5500]/20">
              <Icon size={18} />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
