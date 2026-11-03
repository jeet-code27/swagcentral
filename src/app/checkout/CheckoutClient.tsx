"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Headphones,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User,
  Phone,
  CheckCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cdnImage } from "@/lib/image";

const formatINR = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const inputClass =
  "w-full pl-10 pr-3 py-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#ff5500] focus:ring-2 focus:ring-[#ff5500]/15 transition";

export default function CheckoutClient() {
  const { cart, removeFromCart, clearCart, isLoaded, totalAmount, totalOriginalAmount, totalItems } =
    useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const savings = Math.max(totalOriginalAmount - totalAmount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMsg("Please enter your name and email address.");
      return;
    }
    if (customerEmail.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setErrorMsg("Email addresses do not match. Please check and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          items: cart.map((item) => ({ id: item.id, slug: item.slug })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      clearCart();
      router.push(`/download/${data.downloadToken}`);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-[#ff5500]" />
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-orange-50 text-[#ff5500] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={28} />
        </div>
        <h1 className="font-unbounded font-black text-2xl uppercase text-gray-950">Your cart is empty</h1>
        <p className="text-sm text-gray-600">
          Browse our digital bundles and add something you like to get started.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-unbounded font-bold px-6 py-3 rounded-xl uppercase transition shadow-lg"
        >
          Browse Products
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-6">
        <Link href="/" className="hover:text-[#ff5500] transition">
          Home
        </Link>
        <ChevronRight size={13} className="text-gray-400" />
        <Link href="/shop" className="hover:text-[#ff5500] transition">
          Shop
        </Link>
        <ChevronRight size={13} className="text-gray-400" />
        <span className="text-gray-900 font-bold">Checkout</span>
      </nav>

      <h1 className="font-unbounded font-black text-2xl md:text-3xl uppercase text-gray-950 tracking-tight mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: customer details */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-7 space-y-5">
            <div>
              <h2 className="font-unbounded font-bold text-sm uppercase text-gray-950 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ff5500] text-white text-[11px] flex items-center justify-center">
                  1
                </span>
                Your Details
              </h2>
              <p className="text-xs text-gray-500 mt-1.5">
                Your products will be delivered to this email address.
              </p>
            </div>

            <div className="space-y-4">
              <Field label="Full Name" required>
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address" required>
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Confirm Email" required>
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Re-enter your email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="WhatsApp Number" hint="Optional, for order support">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* How delivery works */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-7 space-y-4">
            <h2 className="font-unbounded font-bold text-sm uppercase text-gray-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#ff5500] text-white text-[11px] flex items-center justify-center">
                2
              </span>
              How You Get Your Products
            </h2>
            <ol className="space-y-3">
              {[
                ["Place your order", "You'll get an order confirmation email right away."],
                ["We confirm your order", "Our team reviews and confirms it, usually within a few hours."],
                ["Get your products", "Download links are emailed to you and shown on your order page."],
              ].map(([title, text], i) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-50 text-[#ff5500] font-unbounded font-bold text-xs flex items-center justify-center flex-shrink-0 border border-orange-100">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <Link
            href="/shop"
            className="hidden lg:inline-flex items-center gap-2 text-xs font-unbounded font-bold text-gray-600 hover:text-[#ff5500] transition uppercase"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>
        </div>

        {/* Right: order summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="font-unbounded font-bold text-sm uppercase text-gray-950">Order Summary</h2>
              <span className="text-xs font-semibold text-gray-500">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>

            <ul className="divide-y divide-gray-100 max-h-[340px] overflow-y-auto">
              {cart.map((item) => (
                <li key={item.id} className="px-5 md:px-6 py-4 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cdnImage(item.thumbnail, 140)}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-contain bg-neutral-950 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-xs font-semibold text-gray-900 hover:text-[#ff5500] line-clamp-2 leading-snug"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-unbounded font-bold text-sm text-[#ff5500]">
                        {formatINR(item.price)}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-[11px] text-gray-400 line-through">
                          {formatINR(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Remove item"
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="px-5 md:px-6 py-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatINR(totalOriginalAmount)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatINR(savings)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-emerald-600 font-semibold">Free (Digital)</span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-dashed border-gray-200">
                <span className="font-unbounded font-bold text-gray-950 uppercase text-sm">Total</span>
                <span className="font-unbounded font-black text-2xl text-[#ff5500]">
                  {formatINR(totalAmount)}
                </span>
              </div>
            </div>

            <div className="px-5 md:px-6 pb-6 space-y-3">
              {errorMsg && (
                <div className="p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-gray-400 text-white font-unbounded font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    Place Order · {formatINR(totalAmount)}
                  </>
                )}
              </button>
              {savings > 0 && (
                <p className="text-center text-xs text-emerald-700 font-semibold">
                  You save {formatINR(savings)} on this order
                </p>
              )}
            </div>
          </section>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: ShieldCheck, label: "Secure Checkout" },
              { icon: CheckCircle, label: "Lifetime Access" },
              { icon: Headphones, label: "WhatsApp Support" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 py-3 px-2">
                <Icon size={18} className="mx-auto text-[#ff5500]" />
                <p className="text-[10px] font-semibold text-gray-700 mt-1.5">{label}</p>
              </div>
            ))}
          </div>
        </aside>
      </form>
    </main>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-[#ff5500]">*</span>}
        {hint && <span className="font-normal text-gray-400"> · {hint}</span>}
      </span>
      <span className="relative block">{children}</span>
    </label>
  );
}
