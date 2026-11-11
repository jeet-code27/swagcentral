"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CheckCircle,
  Clock,
  CreditCard,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Package,
} from "lucide-react";
import { cdnImage } from "@/lib/image";
import { getOrderView, OrderView } from "@/lib/orderState";
import { readJson } from "@/lib/http";

interface AccountOrder {
  orderId: string;
  items: { title: string; thumbnail: string; price: number }[];
  totalAmount: number;
  orderStatus?: "pending" | "delivered" | "cancelled";
  paymentStatus?: "pending" | "completed" | "failed";
  paymentMethod?: string;
  downloadToken: string;
  createdAt: string;
}

const STATUS: Record<OrderView, { label: string; cls: string; icon: typeof Clock; action: string }> = {
  awaiting_payment: {
    label: "Payment Pending",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    icon: CreditCard,
    action: "Complete Payment",
  },
  to_send: {
    label: "Paid · Preparing",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
    action: "View Order",
  },
  delivered: {
    label: "Delivered",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
    action: "Get Downloads",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-gray-100 text-gray-600 border-gray-200",
    icon: Ban,
    action: "View Order",
  },
};

const inputClass =
  "w-full pl-10 pr-3 py-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#ff5500] focus:ring-2 focus:ring-[#ff5500]/15 transition";

export default function AccountClient() {
  const [state, setState] = useState<"loading" | "signed_out" | "signed_in">("loading");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<AccountOrder[]>([]);

  const [step, setStep] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/account/orders", { cache: "no-store" });
    if (res.status === 401) {
      setState("signed_out");
      return;
    }
    const data = await readJson(res);
    if (!res.ok) throw new Error(data.error || "Could not load orders");
    setEmail(data.email);
    setOrders(data.orders);
    setState("signed_in");
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders().catch(() => setState("signed_out"));
  }, [loadOrders]);

  const requestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/account/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setInfo(data.message);
      setStep("code");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(data.error || "Could not verify code");
      setCode("");
      await loadOrders();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/account/logout", { method: "POST" });
    setOrders([]);
    setStep("email");
    setInfo("");
    setState("signed_out");
  };

  if (state === "loading") {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-[#ff5500]" />
      </main>
    );
  }

  if (state === "signed_out") {
    return (
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-12 md:py-20">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-orange-50 text-[#ff5500] rounded-full flex items-center justify-center mx-auto">
              <Package size={26} />
            </div>
            <h1 className="font-unbounded font-black text-xl uppercase text-gray-950">My Orders</h1>
            <p className="text-sm text-gray-500">
              {step === "email"
                ? "Enter the email you used at checkout. We'll send you a 6-digit code — no password needed."
                : `Enter the 6-digit code sent to ${email}.`}
            </p>
          </div>

          {error && <div className="p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200">{error}</div>}
          {info && step === "code" && !error && (
            <div className="p-3 text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">{info}</div>
          )}

          {step === "email" ? (
            <form onSubmit={requestCode} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-gray-400 text-white font-unbounded font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                Send Login Code
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={inputClass + " tracking-[0.4em] font-bold"}
                />
              </div>
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="w-full bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-gray-400 text-white font-unbounded font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                View My Orders
              </button>
              <div className="flex justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError("");
                    setCode("");
                  }}
                  className="text-gray-500 hover:text-gray-900"
                >
                  Change email
                </button>
                <button type="button" onClick={() => requestCode()} disabled={busy} className="text-[#ff5500] font-semibold hover:underline">
                  Resend code
                </button>
              </div>
            </form>
          )}

          <p className="text-[11px] text-center text-gray-400">
            Each order also has its own link in your order emails.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-14 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-unbounded font-black text-2xl md:text-3xl uppercase text-gray-950">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Signed in as {email}</p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-red-600 w-max"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-3">
          <p className="text-sm text-gray-600">No orders yet.</p>
          <Link href="/shop" className="inline-block text-xs font-unbounded font-bold text-[#ff5500] uppercase">
            Browse Products
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const view = getOrderView(order);
            const s = STATUS[view];
            const Icon = s.icon;
            return (
              <li key={order.orderId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-gray-500">
                    <span className="font-mono font-bold text-gray-900">{order.orderId}</span>
                    {" · "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${s.cls}`}>
                    <Icon size={12} /> {s.label}
                  </span>
                </div>
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cdnImage(item.thumbnail, 100)}
                          alt=""
                          className="w-12 h-12 rounded-lg object-contain bg-neutral-950 flex-shrink-0"
                        />
                        <span className="text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 flex-shrink-0">
                    <span className="font-unbounded font-black text-lg text-[#ff5500]">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </span>
                    <Link
                      href={`/download/${order.downloadToken}`}
                      className={`inline-flex items-center gap-1.5 text-xs font-unbounded font-bold px-4 py-2.5 rounded-xl uppercase transition ${
                        view === "delivered" || view === "awaiting_payment"
                          ? "bg-[#ff5500] hover:bg-[#e04b00] text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }`}
                    >
                      {s.action} <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
