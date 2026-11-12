"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  ChevronRight,
  CircleX,
  Filter,
  Clock,
  CreditCard,
  ExternalLink,
  Link2,
  Loader2,
  Mail,
  MessageCircle,
  Pencil,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  X,
} from "lucide-react";
import { cdnImage } from "@/lib/image";
import { pdfDisplayName } from "@/lib/pdf";
import Pagination, { usePagination } from "@/components/Pagination";
import { PdfUploadInput } from "@/components/admin/AdminUI";

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
  paymentStatus?: "pending" | "completed" | "failed";
  paymentMethod?: string;
  paymentMode?: string;
  paymentError?: string;
  paymentAttempts?: number;
  paymentTxnId?: string;
  paidAt?: string;
  confirmationEmailSent?: boolean;
  emailSent: boolean;
  emailSentAt?: string;
  downloadToken: string;
  createdAt: string;
}

/** One plain-language status per order, combining payment and delivery. */
type AdminStatus = "to_send" | "delivered" | "payment_failed" | "not_paid" | "cancelled";
type StatusFilter = AdminStatus | "all";

function adminStatus(o: Order): AdminStatus {
  if (o.orderStatus === "cancelled") return "cancelled";
  if (o.orderStatus === "delivered") return "delivered";
  if (o.paymentStatus === "completed") return "to_send";
  if (o.paymentStatus === "failed") return "payment_failed";
  return "not_paid";
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All orders" },
  { key: "to_send", label: "Paid – products to send" },
  { key: "delivered", label: "Paid – products sent" },
  { key: "payment_failed", label: "Payment failed" },
  { key: "not_paid", label: "Not paid yet" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS: Record<AdminStatus, { label: string; cls: string; icon: typeof Clock }> = {
  to_send: { label: "Paid · Send products", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30", icon: Clock },
  delivered: { label: "Paid · Products sent", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", icon: CheckCircle },
  payment_failed: { label: "Payment failed", cls: "bg-red-500/15 text-red-300 border-red-500/30", icon: CircleX },
  not_paid: { label: "Not paid yet", cls: "bg-gray-500/15 text-gray-300 border-gray-500/30", icon: CreditCard },
  cancelled: { label: "Cancelled", cls: "bg-gray-700/30 text-gray-400 border-gray-600/40", icon: Ban },
};

/** Payment result in plain words: paid how/when, or why it was not paid. */
function paymentSummary(o: Order): { paid: boolean; text: string } {
  if (o.paymentStatus === "completed") {
    const how = o.paymentMode
      ? ` via ${o.paymentMode}`
      : o.paymentMethod && o.paymentMethod !== "PayU"
      ? ` (${o.paymentMethod})`
      : "";
    const when = o.paidAt ? ` · ${fullDate(o.paidAt)}` : "";
    return { paid: true, text: `₹${o.totalAmount.toLocaleString("en-IN")}${how}${when}` };
  }
  if (o.paymentError) return { paid: false, text: o.paymentError };
  if (!o.paymentTxnId && !o.paymentAttempts) {
    return { paid: false, text: "Customer filled in checkout but never opened the payment page" };
  }
  return { paid: false, text: "Waiting — the customer is on the PayU page or has just left it" };
}

const hasAccess = (item: OrderItem) => !!(item.accessUrl || item.pdfFileName);

function timeAgo(value: string) {
  const mins = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fullDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}

const btn = {
  primary:
    "inline-flex items-center justify-center gap-1.5 bg-[#ff5500] hover:bg-[#e04b00] disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition",
  success:
    "inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition",
  secondary:
    "inline-flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-100 text-xs font-semibold px-4 py-2.5 rounded-lg transition",
  ghost:
    "inline-flex items-center justify-center gap-1.5 text-gray-400 hover:text-white text-xs font-semibold px-3 py-2.5 rounded-lg hover:bg-gray-800/60 transition",
  danger:
    "inline-flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-semibold px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit state for a single order
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<{ accessUrl: string; pdfFileName: string }[]>([]);
  const [saveToProduct, setSaveToProduct] = useState(true);

  const [syncing, setSyncing] = useState(false);

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

  /** Asks PayU about recent unpaid orders (catches missed payments and fills in failure reasons). */
  const syncPayments = useCallback(
    async (showResult: boolean) => {
      setSyncing(true);
      try {
        const res = await fetch("/api/admin/orders/sync-payments", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not check payments");
        await loadOrders();
        if (showResult || data.paid > 0) {
          setNotice({
            type: "success",
            text:
              data.paid > 0
                ? `PayU check: ${data.paid} more order${data.paid > 1 ? "s were" : " was"} actually paid and moved to "Paid – products to send".`
                : `PayU check done: ${data.checked} unpaid order${data.checked === 1 ? "" : "s"} checked, no new payments.`,
          });
        }
      } catch (err) {
        if (showResult) setNotice({ type: "error", text: (err as Error).message });
      } finally {
        setSyncing(false);
      }
    },
    [loadOrders]
  );

  useEffect(() => {
    // Show orders right away, then quietly re-check unpaid ones with PayU
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders().then(() => syncPayments(false));
  }, [loadOrders, syncPayments]);

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const replaceOrder = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.orderId === updated.orderId ? updated : o)));
  };

  /** Runs an order API call and shows the result. */
  const run = async (orderId: string, url: string, init: RequestInit, successText: string) => {
    setBusyId(orderId);
    try {
      const res = await fetch(url, init);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      replaceOrder(data.order);
      showNotice("success", successText);
      return true;
    } catch (err) {
      showNotice("error", (err as Error).message);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const patch = (orderId: string, body: object, successText: string) =>
    run(
      orderId,
      `/api/admin/orders/${orderId}`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      successText
    );

  const startEdit = (order: Order) => {
    setEditingId(order.orderId);
    setDraftItems(order.items.map((i) => ({ accessUrl: i.accessUrl || "", pdfFileName: i.pdfFileName || "" })));
  };

  const saveEdit = async (orderId: string) => {
    if (await patch(orderId, { items: draftItems, saveToProduct }, `Links saved for ${orderId}`)) {
      setEditingId(null);
    }
  };

  const sendOrder = (order: Order) => {
    const resend = order.orderStatus === "delivered";
    if (!confirm(`${resend ? "Resend" : "Send"} the products for ${order.orderId} to ${order.customerEmail}?`)) return;
    run(order.orderId, `/api/admin/orders/${order.orderId}/send`, { method: "POST" }, `Products emailed to ${order.customerEmail}`);
  };

  const markPaid = (order: Order) => {
    if (!confirm(`Mark ${order.orderId} as paid (₹${order.totalAmount})?\n\nOnly do this if you have received the money, e.g. by direct UPI.`))
      return;
    patch(order.orderId, { markPaid: true }, `${order.orderId} marked as paid`);
  };

  const cancelOrder = (order: Order) => {
    if (!confirm(`Cancel order ${order.orderId}?`)) return;
    patch(order.orderId, { orderStatus: "cancelled" }, `${order.orderId} cancelled`);
  };

  const counts = Object.fromEntries(
    FILTERS.map(({ key }) => [key, key === "all" ? orders.length : orders.filter((o) => adminStatus(o) === key).length])
  ) as Record<StatusFilter, number>;

  const q = search.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && adminStatus(o) !== statusFilter) return false;
    if (!q) return true;
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerPhone || "").includes(q)
    );
  });
  const { page, totalPages, pageItems, setPage } = usePagination(filtered, 15, `${search}|${statusFilter}`);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-unbounded font-black text-xl md:text-2xl text-white tracking-tight uppercase">Orders</h1>
          <p className="text-xs text-gray-400 mt-1">
            Every order shows whether it was paid, and if not, why. Send products for orders marked{" "}
            <span className="text-amber-300 font-semibold">Paid · Send products</span>.
          </p>
        </div>
        <button
          onClick={() => syncPayments(true)}
          disabled={syncing}
          className={btn.secondary}
          title="Ask PayU for the latest status of unpaid orders"
        >
          <RefreshCw size={14} className={syncing || loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">{syncing ? "Checking PayU…" : "Check payments"}</span>
        </button>
      </div>

      {counts.to_send > 0 && statusFilter !== "to_send" && (
        <button
          onClick={() => setStatusFilter("to_send")}
          className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left hover:bg-amber-500/15 transition"
        >
          <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-200">
            <Clock size={16} className="flex-shrink-0" />
            {counts.to_send} paid order{counts.to_send > 1 ? "s are" : " is"} waiting for products to be sent
          </span>
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1 flex-shrink-0">
            Show <ChevronRight size={14} />
          </span>
        </button>
      )}

      {/* Status filter + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-72 flex-shrink-0">
          <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Filter orders by status"
            className="w-full appearance-none bg-[#131b2e] border border-gray-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff5500] cursor-pointer"
          >
            {FILTERS.map(({ key, label }) => (
              <option key={key} value={key}>
                {label} ({counts[key]})
              </option>
            ))}
          </select>
          <ChevronRight size={15} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search order ID, name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131b2e] border border-gray-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff5500]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div
          className={`sticky top-3 z-20 p-3 rounded-xl text-xs flex items-center gap-2 border shadow-lg ${
            notice.type === "success"
              ? "bg-emerald-950 text-emerald-200 border-emerald-800"
              : "bg-red-950 text-red-200 border-red-800"
          }`}
        >
          {notice.type === "success" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          <span className="flex-1">{notice.text}</span>
          <button onClick={() => setNotice(null)} className="opacity-70 hover:opacity-100" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-red-950/60 text-red-300 border border-red-800 rounded-xl text-xs">{loadError}</div>
      )}

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#ff5500]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#131b2e] border border-gray-800 rounded-2xl p-10 text-center space-y-1">
          <p className="text-sm text-gray-300 font-semibold">
            {q ? "No orders match your search." : statusFilter === "to_send" ? "All caught up! 🎉" : "No orders with this status."}
          </p>
          {!q && statusFilter === "to_send" && (
            <p className="text-xs text-gray-500">There are no paid orders waiting to be sent.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pageItems.map((order) => {
            const view = adminStatus(order);
            const status = STATUS[view];
            const payment = paymentSummary(order);
            const StatusIcon = status.icon;
            const isEditing = editingId === order.orderId;
            const isBusy = busyId === order.orderId;
            const missing = order.items.filter((i) => !hasAccess(i)).length;

            // The single most useful next step for this order
            const next =
              view === "payment_failed" || view === "not_paid"
                ? { tone: "text-gray-400", icon: MessageCircle, text: "Nothing to send. You can message the customer to complete the payment." }
                : view === "to_send" && missing > 0
                ? { tone: "text-amber-300", icon: AlertTriangle, text: `Add the access link for ${missing} product${missing > 1 ? "s" : ""}, then send.` }
                : view === "to_send"
                ? { tone: "text-emerald-300", icon: CheckCircle, text: "Ready to send." }
                : view === "delivered"
                ? { tone: "text-emerald-300/80", icon: Mail, text: order.emailSentAt ? `Products emailed ${timeAgo(order.emailSentAt)}.` : "Delivered." }
                : { tone: "text-gray-500", icon: Ban, text: "This order was cancelled." };
            const NextIcon = next.icon;

            return (
              <article
                key={order.orderId}
                className={`bg-[#131b2e] border rounded-2xl overflow-hidden transition ${
                  isEditing ? "border-[#ff5500]/60" : "border-gray-800"
                }`}
              >
                {/* Top: order + customer + amount */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <Link
                        href={`/admin/orders/${order.orderId}`}
                        className="font-mono font-bold text-sm text-[#ff7a33] hover:underline"
                      >
                        {order.orderId}
                      </Link>
                      <span className="text-[11px] text-gray-500" title={fullDate(order.createdAt)}>
                        {timeAgo(order.createdAt)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{order.customerName}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-0.5">
                        <a href={`mailto:${order.customerEmail}`} className="inline-flex items-center gap-1 hover:text-white break-all">
                          <Mail size={12} className="flex-shrink-0" /> {order.customerEmail}
                        </a>
                        {order.customerPhone && (
                          <a
                            href={whatsappLink(order.customerPhone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-emerald-300"
                          >
                            <MessageCircle size={12} /> {order.customerPhone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                    <span className="font-unbounded font-black text-lg text-white">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.cls}`}>
                      <StatusIcon size={12} /> {status.label}
                    </span>
                  </div>
                </div>

                {/* Payment result */}
                <div
                  className={`mx-4 sm:mx-5 mb-4 px-3 py-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                    payment.paid
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-200"
                      : view === "cancelled"
                      ? "bg-gray-800/30 border-gray-700/50 text-gray-400"
                      : "bg-red-500/5 border-red-500/20 text-red-200"
                  }`}
                >
                  {payment.paid ? (
                    <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <CircleX size={14} className="flex-shrink-0 mt-0.5" />
                  )}
                  <span>
                    <span className="font-bold">{payment.paid ? "Payment received: " : "Not paid: "}</span>
                    {payment.text}
                  </span>
                </div>

                {/* Products */}
                <ul className="border-t border-gray-800 divide-y divide-gray-800/70">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="px-4 sm:px-5 py-3 space-y-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cdnImage(item.thumbnail, 120)}
                          alt=""
                          className="w-11 h-11 rounded-lg object-contain bg-neutral-950 border border-gray-800 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-100 line-clamp-2">{item.title}</p>
                          <p className="text-[11px] text-gray-500">₹{item.price}</p>
                        </div>
                        {!isEditing &&
                          (hasAccess(item) ? (
                            <a
                              href={item.accessUrl || undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={item.accessUrl || pdfDisplayName(item.pdfFileName)}
                              className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full"
                            >
                              <Link2 size={12} />
                              {item.accessUrl && item.pdfFileName ? "Link + PDF" : item.accessUrl ? "Link added" : "PDF added"}
                            </a>
                          ) : (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
                              <AlertTriangle size={12} /> No link
                            </span>
                          ))}
                      </div>

                      {isEditing && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:pl-14">
                          <label className="space-y-1">
                            <span className="text-[11px] font-semibold text-gray-400">Access link</span>
                            <input
                              type="url"
                              placeholder="https://drive.google.com/..."
                              value={draftItems[idx]?.accessUrl || ""}
                              onChange={(e) =>
                                setDraftItems((prev) => prev.map((d, i) => (i === idx ? { ...d, accessUrl: e.target.value } : d)))
                              }
                              className="w-full bg-[#0a0f1d] border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff5500]"
                            />
                          </label>
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-gray-400">PDF (optional)</span>
                            <PdfUploadInput
                              value={draftItems[idx]?.pdfFileName || ""}
                              onChange={(v) =>
                                setDraftItems((prev) => prev.map((d, i) => (i === idx ? { ...d, pdfFileName: v } : d)))
                              }
                            />
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Next step + actions */}
                <div className="border-t border-gray-800 bg-[#0f1626] px-4 sm:px-5 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {isEditing ? (
                    <label className="flex items-start gap-2 text-[11px] text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToProduct}
                        onChange={(e) => setSaveToProduct(e.target.checked)}
                        className="accent-[#ff5500] mt-0.5"
                      />
                      Also save on the product, so future orders get these links automatically
                    </label>
                  ) : (
                    <p className={`flex items-center gap-1.5 text-xs font-medium ${next.tone}`}>
                      <NextIcon size={14} className="flex-shrink-0" /> {next.text}
                    </p>
                  )}

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-end gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => setEditingId(null)} className={btn.secondary}>
                          <X size={14} /> Cancel
                        </button>
                        <button onClick={() => saveEdit(order.orderId)} disabled={isBusy} className={btn.success}>
                          {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Links
                        </button>
                      </>
                    ) : (
                      <>
                        {(view === "not_paid" || view === "payment_failed") && (
                          <>
                            <button onClick={() => cancelOrder(order)} disabled={isBusy} className={btn.danger}>
                              <Ban size={14} /> Cancel
                            </button>
                            <button onClick={() => markPaid(order)} disabled={isBusy} className={btn.success}>
                              <CreditCard size={14} /> Mark as Paid
                            </button>
                          </>
                        )}

                        {view === "to_send" && (
                          <>
                            <button onClick={() => cancelOrder(order)} disabled={isBusy} className={btn.danger}>
                              <Ban size={14} /> Cancel
                            </button>
                            {missing > 0 ? (
                              <button onClick={() => startEdit(order)} disabled={isBusy} className={btn.primary}>
                                <Pencil size={14} /> Add Links
                              </button>
                            ) : (
                              <>
                                <button onClick={() => startEdit(order)} disabled={isBusy} className={btn.secondary}>
                                  <Pencil size={14} /> Edit Links
                                </button>
                                <button onClick={() => sendOrder(order)} disabled={isBusy} className={btn.primary}>
                                  {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Order
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {view === "delivered" && (
                          <>
                            <button onClick={() => startEdit(order)} disabled={isBusy} className={btn.secondary}>
                              <Pencil size={14} /> Edit Links
                            </button>
                            <button onClick={() => sendOrder(order)} disabled={isBusy} className={btn.secondary}>
                              {isBusy ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Resend
                            </button>
                          </>
                        )}

                        {view === "cancelled" && (
                          <button
                            onClick={() => patch(order.orderId, { orderStatus: "pending" }, `${order.orderId} reopened`)}
                            disabled={isBusy}
                            className={btn.secondary}
                          >
                            <RotateCcw size={14} /> Reopen
                          </button>
                        )}

                        <Link
                          href={`/download/${order.downloadToken}`}
                          target="_blank"
                          className={btn.ghost}
                          title="Open the customer's order page"
                        >
                          <ExternalLink size={14} /> Customer View
                        </Link>
                        <Link href={`/admin/orders/${order.orderId}`} className={btn.ghost}>
                          Details <ChevronRight size={14} />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
}
