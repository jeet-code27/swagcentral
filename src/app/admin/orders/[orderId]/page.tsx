"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  Pencil,
  Save,
  Send,
  X,
} from "lucide-react";
import {
  Card,
  DetailRow,
  ErrorState,
  LoadingState,
  PageHeader,
  PdfUploadInput,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/admin/AdminUI";
import { cdnImage } from "@/lib/image";
import { pdfDisplayName } from "@/lib/pdf";

interface OrderItem {
  productId: string;
  title: string;
  thumbnail: string;
  price: number;
  deliveryType: "link" | "pdf" | "both";
  accessUrl?: string;
  pdfFileName?: string;
}

interface OrderDetail {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod: string;
  orderStatus?: "pending" | "delivered" | "cancelled";
  confirmationEmailSent?: boolean;
  emailSent: boolean;
  emailSentAt?: string;
  deliveredAt?: string;
  downloadToken: string;
  createdAt: string;
  updatedAt: string;
}

const DELIVERY_LABELS = { link: "Drive / Canva link", pdf: "PDF file", both: "Link + PDF" };

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const hasAccess = (item: OrderItem) => !!(item.accessUrl || item.pdfFileName);

function StatusBadge({ status }: { status: "pending" | "delivered" | "cancelled" }) {
  const styles = {
    pending: ["bg-amber-500/20 text-amber-400 border-amber-500/30", Clock, "PENDING"],
    delivered: ["bg-emerald-500/20 text-emerald-400 border-emerald-500/30", CheckCircle, "DELIVERED"],
    cancelled: ["bg-red-500/20 text-red-400 border-red-500/30", Ban, "CANCELLED"],
  } as const;
  const [cls, Icon, label] = styles[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border ${cls}`}>
      <Icon size={11} /> {label}
    </span>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftItems, setDraftItems] = useState<{ accessUrl: string; pdfFileName: string }[]>([]);
  const [saveToProduct, setSaveToProduct] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load order");
        setOrder(data.order);
      })
      .catch((err) => setError((err as Error).message));
  }, [orderId]);

  if (error) return <ErrorState message={error} />;
  if (!order) return <LoadingState />;

  const status = order.orderStatus || "pending";
  const ready = order.items.every(hasAccess);

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const call = async (url: string, init: RequestInit, successText: string) => {
    setBusy(true);
    try {
      const res = await fetch(url, init);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setOrder(data.order);
      showNotice("success", successText);
      return true;
    } catch (err) {
      showNotice("error", (err as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const startEdit = () => {
    setDraftItems(order.items.map((i) => ({ accessUrl: i.accessUrl || "", pdfFileName: i.pdfFileName || "" })));
    setEditing(true);
  };

  const saveLinks = async () => {
    const ok = await call(
      `/api/admin/orders/${order.orderId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: draftItems, saveToProduct }),
      },
      "Links saved"
    );
    if (ok) setEditing(false);
  };

  const sendOrder = () => {
    const verb = status === "delivered" ? "Resend" : "Send";
    if (!confirm(`${verb} products for ${order.orderId} to ${order.customerEmail}?`)) return;
    call(`/api/admin/orders/${order.orderId}/send`, { method: "POST" }, `Products emailed to ${order.customerEmail}`);
  };

  const setStatus = (orderStatus: "pending" | "cancelled") => {
    if (orderStatus === "cancelled" && !confirm(`Cancel order ${order.orderId}?`)) return;
    call(
      `/api/admin/orders/${order.orderId}`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderStatus }) },
      orderStatus === "cancelled" ? "Order cancelled" : "Order reopened"
    );
  };

  const phoneDigits = (order.customerPhone || "").replace(/\D/g, "");
  const whatsappNumber = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/orders"
        backLabel="All orders"
        title={`Order ${order.orderId}`}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} /> Placed {formatDate(order.createdAt)}
          </span>
        }
        actions={
          <>
            <Link href={`/download/${order.downloadToken}`} target="_blank" className={secondaryButton}>
              <ExternalLink size={14} /> Customer Page
            </Link>
            {status === "pending" && (
              <button onClick={() => setStatus("cancelled")} disabled={busy} className={secondaryButton + " text-red-300"}>
                <Ban size={14} /> Cancel
              </button>
            )}
            {status === "cancelled" && (
              <button onClick={() => setStatus("pending")} disabled={busy} className={secondaryButton}>
                Reopen
              </button>
            )}
            {status !== "cancelled" && (
              <button
                onClick={sendOrder}
                disabled={busy || !ready || editing}
                title={!ready ? "Add an access link for every item first" : ""}
                className={primaryButton}
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {status === "delivered" ? "Resend" : "Send Order"}
              </button>
            )}
          </>
        }
      />

      {notice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            notice.type === "success"
              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
              : "bg-red-950/60 text-red-300 border-red-800"
          }`}
        >
          {notice.type === "success" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          {notice.text}
        </div>
      )}

      {!ready && status === "pending" && (
        <div className="p-4 bg-amber-950/40 border border-amber-700/50 rounded-2xl text-xs text-amber-200 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          Some products have no access link. Click Edit Links, add them, then Send Order.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-unbounded font-bold text-xs text-white uppercase tracking-wide">
                Products ({order.items.length})
              </h2>
              {status !== "cancelled" && !editing && (
                <button onClick={startEdit} className={secondaryButton}>
                  <Pencil size={13} /> Edit Links
                </button>
              )}
            </div>

            <ul className="divide-y divide-gray-800/70">
              {order.items.map((item, idx) => (
                <li key={idx} className="py-4 flex flex-col md:flex-row gap-4">
                  <div className="flex items-center gap-3 md:w-72 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cdnImage(item.thumbnail, 140)}
                      alt=""
                      className="w-14 h-14 rounded-lg object-contain bg-neutral-950 border border-gray-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/products/${item.productId}`}
                        className="text-xs font-semibold text-white hover:text-[#ff5500] line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <div className="text-[11px] text-gray-400">
                        ₹{item.price} · {DELIVERY_LABELS[item.deliveryType] || item.deliveryType}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {editing ? (
                      <div className="space-y-2">
                        <input
                          type="url"
                          placeholder="Access link (Google Drive / Canva / Notion)"
                          value={draftItems[idx]?.accessUrl || ""}
                          onChange={(e) =>
                            setDraftItems((prev) => prev.map((d, i) => (i === idx ? { ...d, accessUrl: e.target.value } : d)))
                          }
                          className={inputClass}
                        />
                        <PdfUploadInput
                          value={draftItems[idx]?.pdfFileName || ""}
                          onChange={(v) =>
                            setDraftItems((prev) => prev.map((d, i) => (i === idx ? { ...d, pdfFileName: v } : d)))
                          }
                        />
                      </div>
                    ) : hasAccess(item) ? (
                      <div className="space-y-1 text-[11px]">
                        {item.accessUrl && (
                          <a
                            href={item.accessUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline break-all inline-flex items-start gap-1"
                          >
                            <CheckCircle size={12} className="flex-shrink-0 mt-0.5" />
                            {item.accessUrl}
                          </a>
                        )}
                        {item.pdfFileName && <div className="text-gray-300">PDF: {pdfDisplayName(item.pdfFileName)}</div>}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                        <AlertTriangle size={12} /> No access link added
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {editing && (
              <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[11px] text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveToProduct}
                    onChange={(e) => setSaveToProduct(e.target.checked)}
                    className="accent-[#ff5500]"
                  />
                  Also save these links on the products (future orders get them automatically)
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className={secondaryButton}>
                    <X size={13} /> Cancel
                  </button>
                  <button onClick={saveLinks} disabled={busy} className={primaryButton}>
                    {busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Links
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
              <span className="font-unbounded font-bold text-xs text-gray-300 uppercase">Order Total</span>
              <span className="font-unbounded font-black text-xl text-[#ff5500]">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Customer">
            <dl>
              <DetailRow label="Name">{order.customerName}</DetailRow>
              <DetailRow label="Email">
                <a href={`mailto:${order.customerEmail}`} className="text-[#ff5500] hover:underline inline-flex items-center gap-1">
                  <Mail size={12} /> {order.customerEmail}
                </a>
              </DetailRow>
              <DetailRow label="WhatsApp">
                {order.customerPhone ? (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    <MessageCircle size={12} /> {order.customerPhone}
                  </a>
                ) : (
                  <span className="text-gray-500">Not given</span>
                )}
              </DetailRow>
            </dl>
          </Card>

          <Card title="Order Timeline">
            <dl>
              <DetailRow label="Placed">{formatDate(order.createdAt)}</DetailRow>
              <DetailRow label="Confirmation Email">
                {order.confirmationEmailSent ? (
                  <span className="text-emerald-400">Sent</span>
                ) : (
                  <span className="text-amber-400">Not sent</span>
                )}
              </DetailRow>
              <DetailRow label="Delivered">{formatDate(order.deliveredAt)}</DetailRow>
              <DetailRow label="Products Emailed">{formatDate(order.emailSentAt)}</DetailRow>
              <DetailRow label="Last Updated">{formatDate(order.updatedAt)}</DetailRow>
            </dl>
          </Card>

          <Card title="Payment">
            <dl>
              <DetailRow label="Status">
                <span className={order.paymentStatus === "completed" ? "text-emerald-400" : "text-amber-400"}>
                  {order.paymentStatus === "completed" ? "Completed" : order.paymentStatus === "failed" ? "Failed" : "Pending"}
                </span>
              </DetailRow>
              <DetailRow label="Method">{order.paymentMethod}</DetailRow>
              <DetailRow label="Currency">{order.currency}</DetailRow>
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}
