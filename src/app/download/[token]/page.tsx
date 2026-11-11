"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  ExternalLink,
  Download,
  Mail,
  Zap,
  ArrowLeft,
  ShieldCheck,
  Headphones,
  Loader2,
  Clock,
  XCircle,
  CreditCard,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cdnImage } from "@/lib/image";
import { redirectToPayu } from "@/lib/payuClient";
import { useCart } from "@/context/CartContext";
import { readJson } from "@/lib/http";


interface DownloadItem {
  title: string;
  thumbnail?: string;
  price: number;
  deliveryType: "link" | "pdf" | "both";
  accessUrl?: string;
  pdfFileName?: string;
}

type OrderState = "loading" | "notfound" | "pending" | "delivered" | "cancelled";

function DownloadContent() {
  const params = useParams();
  const token = params?.token as string;
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [orderState, setOrderState] = useState<OrderState>("loading");
  const [orderId, setOrderId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const { removeFromCart } = useCart();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    fetch(`/api/order/status?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data?.order) {
          setOrderState("notfound");
          return;
        }
        setOrderId(data.order.orderId);
        setDownloadItems(data.order.items || []);
        setOrderState(data.order.orderStatus || "pending");
        // The order is placed: remove its products from the cart (kept until now so "back" from PayU works)
        (data.order.items || []).forEach((item: { productId?: string }) => {
          if (item.productId) removeFromCart(item.productId);
        });
        setPaymentStatus(data.order.paymentStatus || "pending");
        setPaymentMethod(data.order.paymentMethod || "");
        setTotalAmount(data.order.totalAmount || 0);

        if (data.order.orderStatus === "delivered") {
          try {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          } catch {
            // Ignore if canvas-confetti is not loaded
          }
        }
      })
      .catch(() => setOrderState("notfound"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (orderState === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-gray-500">
        <Loader2 size={32} className="animate-spin text-[#ff5500]" />
      </div>
    );
  }

  if (orderState === "notfound") {
    return (
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-20 text-center space-y-4">
        <h1 className="font-unbounded font-black text-2xl uppercase text-gray-950">Order Not Found</h1>
        <p className="text-sm text-gray-600">
          This link is invalid or has expired. Please check the link in your email or contact support on
          WhatsApp +91 9821774565.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-unbounded font-bold text-[#ff5500] uppercase">
          <ArrowLeft size={14} /> Back to Store
        </Link>
      </main>
    );
  }

  const isDelivered = orderState === "delivered";
  const isCancelled = orderState === "cancelled";
  // Online orders must be paid before we deliver them
  const needsPayment = !isDelivered && !isCancelled && paymentMethod === "PayU" && paymentStatus !== "completed";
  const paymentFailed = needsPayment && paymentStatus === "failed";

  const payNow = async () => {
    setPaying(true);
    setPayError("");
    try {
      const res = await fetch("/api/payment/payu/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "Could not start payment");
      redirectToPayu(data.payment);
    } catch (err) {
      setPayError((err as Error).message);
      setPaying(false);
    }
  };

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
      {/* Success Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#111111] text-white p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            {isDelivered ? <CheckCircle size={36} /> : paymentFailed ? <XCircle size={36} className="text-red-400" /> : <Clock size={36} />}
          </div>

          <h1 className="font-unbounded font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
            {isDelivered
              ? "ORDER DELIVERED!"
              : isCancelled
              ? "ORDER CANCELLED"
              : paymentFailed
              ? "PAYMENT FAILED"
              : needsPayment
              ? "PAYMENT PENDING"
              : "ORDER CONFIRMED!"}
          </h1>
          <p className="font-unbounded font-bold text-xs sm:text-sm text-[#ff5500] uppercase mt-1 tracking-wider">
            {isDelivered
              ? "YOUR DIGITAL PRODUCTS ARE READY"
              : isCancelled
              ? "PLEASE CONTACT SUPPORT FOR HELP"
              : needsPayment
              ? "COMPLETE PAYMENT TO GET YOUR PRODUCTS"
              : "YOU'LL GET YOUR PRODUCTS BY EMAIL WITHIN 12 HOURS"}
          </p>
          {orderId && <p className="text-[11px] text-gray-400 mt-2 font-mono">Order ID: {orderId}</p>}

          {!isCancelled && !needsPayment && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs text-gray-200">
              <Mail size={14} className="text-yellow-400" />
              <span>
                {isDelivered
                  ? "We also sent your access links to your email inbox!"
                  : "An order confirmation has been sent to your email."}
              </span>
            </div>
          )}
        </div>

        {needsPayment && (
          <div className="m-6 md:m-8 mb-0 md:mb-0 p-5 rounded-xl border border-amber-200 bg-amber-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-amber-900">
              <p className="font-bold">
                {paymentFailed ? "Your payment did not go through." : "We haven't received your payment yet."}
              </p>
              <p className="text-xs mt-0.5">
                If money was deducted, it will update here automatically within a few minutes. Otherwise, pay below.
              </p>
              {payError && <p className="text-xs text-red-600 mt-1">{payError}</p>}
            </div>
            <button
              onClick={payNow}
              disabled={paying}
              className="inline-flex items-center justify-center gap-2 bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-gray-400 text-white text-xs font-unbounded font-bold px-6 py-3 rounded-xl uppercase whitespace-nowrap"
            >
              {paying ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
              {paymentFailed ? "Try Again" : "Pay Now"} · ₹{totalAmount}
            </button>
          </div>
        )}

        {/* Product Items Access Box */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-unbounded font-bold text-sm text-gray-900 uppercase">
              {isDelivered ? "Your Purchased Digital Bundles" : "Your Order Summary"}
            </h2>
            {isDelivered ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck size={14} /> Lifetime Access Granted
              </span>
            ) : !isCancelled ? (
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                <Clock size={14} /> {needsPayment ? "Awaiting Payment" : "Delivery Pending"}
              </span>
            ) : null}
          </div>

          <div className="space-y-4">
            {downloadItems.map((item, index) => (
              <div
                key={index}
                className="p-5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {item.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cdnImage(item.thumbnail, 160)}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-contain bg-neutral-950 flex-shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-unbounded font-bold text-sm text-gray-950">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Format:{" "}
                      {item.deliveryType === "pdf"
                        ? "Direct PDF Guide"
                        : item.deliveryType === "both"
                        ? "Drive Cloud Folder + PDF"
                        : "Google Drive / Canva Link"}
                    </p>
                  </div>
                </div>

                {/* Access Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {!isDelivered && (
                    <span className="text-xs font-semibold text-gray-500">₹{item.price}</span>
                  )}
                  {item.accessUrl && (
                    <a
                      href={item.accessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-unbounded font-bold px-4 py-2.5 rounded-lg transition shadow uppercase"
                    >
                      <ExternalLink size={14} />
                      <span>Open Drive Link</span>
                    </a>
                  )}

                  {item.pdfFileName && (
                    <a
                      href={`/api/download/file?file=${encodeURIComponent(item.pdfFileName)}&token=${token}`}
                      download
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-unbounded font-bold px-4 py-2.5 rounded-lg transition shadow uppercase"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Support Help box */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="space-y-0.5">
              <span className="font-bold flex items-center gap-1.5">
                <Headphones size={15} className="text-[#ff5500]" />
                Need help downloading or extracting files?
              </span>
              <p className="text-amber-800 text-[11px]">
                Our support team is available on WhatsApp +91 9821774565 or email swagcentral012@gmail.com
              </p>
            </div>
            <a
              href="https://wa.me/919821774565"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-4 py-2 rounded-lg font-unbounded font-bold text-[11px] whitespace-nowrap"
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="text-center pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-xs font-unbounded font-bold text-gray-700 hover:text-[#ff5500] transition uppercase"
            >
              View All My Orders
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-unbounded font-bold text-gray-700 hover:text-[#ff5500] transition uppercase"
            >
              <ArrowLeft size={14} />
              <span>Return to SwagCentral Store</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-20 text-gray-500">
            <Loader2 size={32} className="animate-spin text-[#ff5500]" />
          </div>
        }
      >
        <DownloadContent />
      </Suspense>
      <Footer />
    </div>
  );
}
