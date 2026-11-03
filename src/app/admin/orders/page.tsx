"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  CheckCircle,
  RefreshCw,
  Search,
  Send,
  Pencil,
  Save,
  X,
  AlertTriangle,
  Loader2,
  Clock,
  Ban,
} from "lucide-react";
import { cdnImage } from "@/lib/image";

interface OrderItem {
  productId: string;
  title: string;
  thumbnail: string;
  price: number;
  deliveryType: "link" | "pdf" | "both";
  accessUrl?: string;
  pdfFileName?: string;
}

interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus?: "pending" | "delivered" | "cancelled";
  confirmationEmailSent?: boolean;
  emailSent: boolean;
  emailSentAt?: string;
  downloadToken: string;
  createdAt: string;
}

type StatusFilter = "all" | "pending" | "delivered" | "cancelled";

const hasAccess = (item: OrderItem) => !!(item.accessUrl || item.pdfFileName);

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit state for a single order
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<{ accessUrl: string; pdfFileName: string }[]>([]);
  const [saveToProduct, setSaveToProduct] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders");
      setOrders(data.orders);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [loadOrders]);

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const replaceOrder = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.orderId === updated.orderId ? updated : o)));
  };

  const startEdit = (order: Order) => {
    setEditingId(order.orderId);
    setDraftItems(
      order.items.map((i) => ({ accessUrl: i.accessUrl || "", pdfFileName: i.pdfFileName || "" }))
    );
  };

  const saveEdit = async (orderId: string) => {
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: draftItems, saveToProduct }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      replaceOrder(data.order);
      setEditingId(null);
      showNotice("success", `Links saved for ${orderId}`);
    } catch (err) {
      showNotice("error", (err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const sendOrder = async (order: Order) => {
    const verb = order.orderStatus === "delivered" ? "Resend" : "Send";
    if (!confirm(`${verb} products for ${order.orderId} to ${order.customerEmail}?`)) return;

    setBusyId(order.orderId);
    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}/send`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send order");
      replaceOrder(data.order);
      showNotice("success", `Order ${order.orderId} sent to ${order.customerEmail}`);
    } catch (err) {
      showNotice("error", (err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const setStatus = async (order: Order, orderStatus: "pending" | "cancelled") => {
    if (orderStatus === "cancelled" && !confirm(`Cancel order ${order.orderId}?`)) return;
    setBusyId(order.orderId);
    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      replaceOrder(data.order);
    } catch (err) {
      showNotice("error", (err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => (o.orderStatus || "pending") === "pending").length,
    delivered: orders.filter((o) => o.orderStatus === "delivered").length,
    cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
  };

  const q = search.toLowerCase();
  const filtered = orders.filter((o) => {
    const status = o.orderStatus || "pending";
    if (statusFilter !== "all" && status !== statusFilter) return false;
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-unbounded font-black text-2xl md:text-3xl text-white tracking-tight uppercase">
            ORDERS & DELIVERY
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review new orders, add product links if missing, then click Send Order to email the customer.
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-unbounded font-bold px-4 py-2.5 rounded-xl transition uppercase"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            notice.type === "success"
              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
              : "bg-red-950/60 text-red-300 border-red-800"
          }`}
        >
          {notice.type === "success" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#131b2e] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(["pending", "delivered", "cancelled", "all"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-unbounded font-bold uppercase transition ${
                statusFilter === s
                  ? "bg-[#ff5500] text-white"
                  : "bg-[#0a0f1d] text-gray-400 hover:text-white border border-gray-700"
              }`}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>
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
      </div>

      {loadError && (
        <div className="p-4 bg-red-950/60 text-red-300 border border-red-800 rounded-xl text-xs">
          {loadError}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#ff5500]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#131b2e] border border-gray-800 rounded-2xl p-10 text-center text-xs text-gray-400">
          No {statusFilter !== "all" ? statusFilter : ""} orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status = order.orderStatus || "pending";
            const isEditing = editingId === order.orderId;
            const isBusy = busyId === order.orderId;
            const ready = order.items.every(hasAccess);

            return (
              <div
                key={order.orderId}
                className="bg-[#131b2e] border border-gray-800 rounded-2xl overflow-hidden"
              >
                {/* Order header */}
                <div className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-800">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <div className="font-mono font-bold text-[#ff5500] text-sm">{order.orderId}</div>
                      <span className="text-[10px] text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs">{order.customerName}</div>
                      <div className="text-[11px] text-gray-400">{order.customerEmail}</div>
                      {order.customerPhone && (
                        <div className="text-[11px] text-gray-500">{order.customerPhone}</div>
                      )}
                    </div>
                    <div className="font-unbounded font-black text-white text-sm">
                      ₹{order.totalAmount}
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {status !== "cancelled" && !isEditing && (
                      <button
                        onClick={() => startEdit(order)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg transition"
                      >
                        <Pencil size={13} />
                        <span>Edit Links</span>
                      </button>
                    )}

                    {status !== "cancelled" && (
                      <button
                        onClick={() => sendOrder(order)}
                        disabled={isBusy || !ready || isEditing}
                        title={!ready ? "Add an access link for every item first" : ""}
                        className="inline-flex items-center gap-1.5 bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-gray-700 disabled:text-gray-400 text-white text-[11px] font-unbounded font-bold px-4 py-2 rounded-lg transition uppercase"
                      >
                        {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        <span>{status === "delivered" ? "Resend" : "Send Order"}</span>
                      </button>
                    )}

                    {status === "pending" && (
                      <button
                        onClick={() => setStatus(order, "cancelled")}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-[11px] font-bold px-2 py-2"
                      >
                        <Ban size={13} />
                        <span>Cancel</span>
                      </button>
                    )}
                    {status === "cancelled" && (
                      <button
                        onClick={() => setStatus(order, "pending")}
                        disabled={isBusy}
                        className="text-gray-400 hover:text-white text-[11px] font-bold px-2 py-2"
                      >
                        Reopen
                      </button>
                    )}

                    <Link
                      href={`/download/${order.downloadToken}`}
                      target="_blank"
                      className="text-[#ff5500] hover:underline inline-flex items-center gap-1 text-[11px] font-bold px-2"
                    >
                      <span>Customer Page</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-800/60">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-4 md:px-5 flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex items-center gap-3 md:w-80 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cdnImage(item.thumbnail, 120)}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-contain bg-neutral-950 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white line-clamp-2">{item.title}</div>
                          <div className="text-[11px] text-gray-400">₹{item.price}</div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="url"
                              placeholder="Access link (Google Drive / Canva / Notion)"
                              value={draftItems[idx]?.accessUrl || ""}
                              onChange={(e) =>
                                setDraftItems((prev) =>
                                  prev.map((d, i) => (i === idx ? { ...d, accessUrl: e.target.value } : d))
                                )
                              }
                              className="w-full bg-[#0a0f1d] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff5500]"
                            />
                            <input
                              type="text"
                              placeholder="PDF file name (optional, from server downloads folder)"
                              value={draftItems[idx]?.pdfFileName || ""}
                              onChange={(e) =>
                                setDraftItems((prev) =>
                                  prev.map((d, i) => (i === idx ? { ...d, pdfFileName: e.target.value } : d))
                                )
                              }
                              className="w-full bg-[#0a0f1d] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff5500]"
                            />
                          </div>
                        ) : hasAccess(item) ? (
                          <div className="space-y-1 text-[11px]">
                            {item.accessUrl && (
                              <a
                                href={item.accessUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:underline break-all inline-flex items-center gap-1"
                              >
                                <CheckCircle size={12} className="flex-shrink-0" />
                                {item.accessUrl}
                              </a>
                            )}
                            {item.pdfFileName && (
                              <div className="text-gray-300">PDF: {item.pdfFileName}</div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                            <AlertTriangle size={12} />
                            No access link added — click Edit Links
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="p-4 md:px-5 bg-[#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-[11px] text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToProduct}
                        onChange={(e) => setSaveToProduct(e.target.checked)}
                        className="accent-[#ff5500]"
                      />
                      Also save these links on the product (future orders get them automatically)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-[11px] font-bold px-3 py-2"
                      >
                        <X size={13} />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={() => saveEdit(order.orderId)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-4 py-2 rounded-lg transition"
                      >
                        {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        <span>Save Links</span>
                      </button>
                    </div>
                  </div>
                )}

                {order.emailSentAt && (
                  <div className="px-5 py-2 text-[10px] text-gray-500 border-t border-gray-800">
                    Products emailed on {formatDate(order.emailSentAt)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "delivered" | "cancelled" }) {
  if (status === "delivered") {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/30">
        <CheckCircle size={11} /> DELIVERED
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded border border-red-500/30">
        <Ban size={11} /> CANCELLED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/30">
      <Clock size={11} /> PENDING
    </span>
  );
}
