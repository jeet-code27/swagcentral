"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, ArrowRight, ShieldCheck, Zap, Lock, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    totalAmount,
    totalItems,
  } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerEmail || !customerName) {
      setErrorMsg("Please provide your name and email for digital delivery.");
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
          items: cart,
          totalAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process order");
      }

      // Order created successfully!
      clearCart();
      setIsCartOpen(false);

      // Redirect to instant download and delivery hub page
      router.push(`/download/${data.downloadToken}`);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="font-unbounded font-black text-lg text-gray-950 uppercase">
                YOUR CART
              </span>
              <span className="bg-[#ff5500] text-white text-[11px] font-bold px-2 py-0.5 rounded-full font-unbounded">
                {totalItems}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-black transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 bg-orange-50 text-[#ff5500] rounded-full flex items-center justify-center mx-auto">
                  <Zap size={24} />
                </div>
                <h4 className="font-unbounded font-bold text-gray-800 text-sm">
                  Your cart is empty
                </h4>
                <p className="text-xs text-gray-500">
                  Select your favorite digital bundles to unlock instant access.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-14 h-14 rounded-lg object-contain bg-neutral-950 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-gray-900 truncate">
                      {item.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-unbounded font-bold text-xs text-[#ff5500]">
                        ₹{item.price.toFixed(2)}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}

            {/* Delivery Details Form */}
            {cart.length > 0 && (
              <form id="checkout-form" onSubmit={handleCheckout} className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase font-unbounded">
                  <Lock size={13} className="text-[#ff5500]" />
                  <span>Digital Delivery Information</span>
                </div>

                {errorMsg && (
                  <div className="p-2 text-xs text-red-600 bg-red-50 rounded border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Email Address (For Instant Access Delivery) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your-email@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    WhatsApp Number (For order support)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9821774565"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] flex items-center gap-1.5 border border-emerald-200">
                  <ShieldCheck size={14} className="flex-shrink-0 text-emerald-600" />
                  <span>Instant automated email & on-screen download links.</span>
                </div>
              </form>
            )}
          </div>

          {/* Footer Checkout Bar */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Total Payable:</span>
                <span className="font-unbounded font-black text-xl text-[#ff5500]">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-gray-400 text-white font-unbounded font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing & Generating Access...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Get Instant Access</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
