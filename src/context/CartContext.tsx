"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle, X } from "lucide-react";
import { productParams, trackPixel } from "@/lib/metaPixel";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  category: string;
  deliveryType: "link" | "pdf" | "both";
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  /** Adds an item; pass `silent` to skip the "added to cart" toast (e.g. Buy Now). */
  addToCart: (item: Omit<CartItem, "quantity">, options?: { silent?: boolean }) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  /** False until the saved cart has been read from localStorage. */
  isLoaded: boolean;
  totalAmount: number;
  totalOriginalAmount: number;
  totalItems: number;
}

const STORAGE_KEY = "swagcentral_cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastItem, setToastItem] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse cart storage", e);
    }
    setIsLoaded(true);
  }, []);

  // Sync to localStorage (only after the initial load, so we never overwrite the saved cart)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cart, isLoaded]);

  const addToCart: CartContextType["addToCart"] = (product, options) => {
    if (!cart.some((item) => item.id === product.id)) {
      trackPixel("AddToCart", {
        ...productParams([{ id: product.id, price: product.price }]),
        content_name: product.title,
        content_category: product.category,
      });
    }
    setCart((prev) => {
      // Digital products only need quantity 1 per purchase
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });

    if (!options?.silent) {
      setToastItem(product.title);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToastItem(null), 3500);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
  const totalOriginalAmount = cart.reduce(
    (sum, item) => sum + Math.max(item.originalPrice || 0, item.price),
    0
  );
  const totalItems = cart.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isLoaded,
        totalAmount,
        totalOriginalAmount,
        totalItems,
      }}
    >
      {children}

      {/* "Added to cart" toast */}
      {toastItem && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 bg-[#111111] text-white rounded-xl shadow-2xl border border-white/10 p-4 flex items-start gap-3 animate-fadeIn">
          <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold">Added to cart</p>
            <p className="text-[11px] text-gray-400 truncate">{toastItem}</p>
            <Link
              href="/checkout"
              onClick={() => setToastItem(null)}
              className="inline-block mt-2 bg-[#ff5500] hover:bg-[#e04b00] text-white text-[11px] font-unbounded font-bold px-3 py-1.5 rounded-lg uppercase transition"
            >
              Checkout Now
            </Link>
          </div>
          <button
            onClick={() => setToastItem(null)}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
