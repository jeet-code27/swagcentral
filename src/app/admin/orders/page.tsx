"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ExternalLink,
  Mail,
  CheckCircle,
  RefreshCw,
  Search,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const initialOrders = [
    {
      id: "SWAG-1094A",
      customerName: "Rahul Sharma",
      customerEmail: "rahul.sharma@gmail.com",
      product: "The Ultimate Claude Bundle (Drive + PDF)",
      amount: "₹499.00",
      paymentStatus: "Paid (UPI)",
      emailSent: true,
      token: "demo-token-1",
      date: "Today, 03:42 PM",
    },
    {
      id: "SWAG-1093B",
      customerName: "Priya Designs",
      customerEmail: "priya.designs@outlook.com",
      product: "Canva Template Mega Pack (Canva Link)",
      amount: "₹349.00",
      paymentStatus: "Paid (Card)",
      emailSent: true,
      token: "demo-token-2",
      date: "Today, 01:15 PM",
    },
    {
      id: "SWAG-1092C",
      customerName: "Vikram Malhotra",
      customerEmail: "vikram99@yahoo.com",
      product: "100,000+ Digital Assets Mega Bundle",
      amount: "₹499.00",
      paymentStatus: "Paid (NetBanking)",
      emailSent: true,
      token: "demo-token-3",
      date: "Yesterday, 07:20 PM",
    },
    {
      id: "SWAG-1091D",
      customerName: "Anita Roy",
      customerEmail: "anita.tech@gmail.com",
      product: "10,000+ ChatGPT Prompts & Handbook",
      amount: "₹249.00",
      paymentStatus: "Paid (UPI)",
      emailSent: true,
      token: "demo-token-4",
      date: "Yesterday, 04:10 PM",
    },
  ];

  const handleResend = (id: string, email: string) => {
    setResendingId(id);
    setTimeout(() => {
      setResendingId(null);
      setSuccessNotice(`Access email successfully re-dispatched to ${email}`);
      setTimeout(() => setSuccessNotice(null), 4000);
    }, 1200);
  };

  const filtered = initialOrders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-unbounded font-black text-2xl md:text-3xl text-white tracking-tight uppercase">
          CUSTOMER ORDERS & DIGITAL FULFILLMENT
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Monitor instant access delivery tokens, payment confirmations, and automated mail logs.
        </p>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-950/60 text-emerald-300 border border-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-[#131b2e] p-4 rounded-xl border border-gray-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff5500]"
          />
        </div>
        <span className="text-xs font-semibold text-gray-400">
          Showing {filtered.length} orders
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-[#131b2e] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f172a] text-gray-400 font-unbounded uppercase text-[10px]">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Purchased Asset</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Email Delivery</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-800/30 transition">
                  <td className="p-4">
                    <div className="font-mono font-bold text-[#ff5500]">{ord.id}</div>
                    <span className="text-[10px] text-gray-500">{ord.date}</span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{ord.customerName}</div>
                    <span className="text-[11px] text-gray-400">{ord.customerEmail}</span>
                  </td>
                  <td className="p-4 max-w-xs truncate text-gray-200">
                    {ord.product}
                  </td>
                  <td className="p-4 font-unbounded font-black text-white">
                    {ord.amount}
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle size={13} />
                      <span>Sent</span>
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleResend(ord.id, ord.customerEmail)}
                        disabled={resendingId === ord.id}
                        className="text-gray-400 hover:text-white flex items-center gap-1 font-semibold"
                        title="Resend email"
                      >
                        <RefreshCw
                          size={13}
                          className={resendingId === ord.id ? "animate-spin" : ""}
                        />
                        <span>Resend</span>
                      </button>

                      <Link
                        href={`/download/${ord.token}`}
                        target="_blank"
                        className="text-[#ff5500] hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Access Hub</span>
                        <ExternalLink size={12} />
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
