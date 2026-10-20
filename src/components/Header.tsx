"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, User, Heart, ShoppingBag, Phone, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
      {/* Top utility bar */}
      <div className="bg-[#111111] text-gray-300 text-xs py-2 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="bg-[#ff5500] text-white px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider font-unbounded">
              BEST DIGITAL PRODUCTS
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-gray-300 hover:text-white transition">
              <Phone size={13} className="text-[#ff5500]" />
              <span>Need help?</span>
              <a href="tel:+919821774565" className="font-semibold text-white hover:underline">
                +91 9821774565
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/blog" className="hover:text-white transition">Blog</Link>
            <Link href="/help" className="hover:text-white transition">Help</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <span className="text-gray-600">|</span>
            <span className="font-bold text-white">INR (₹)</span>
            <span>English</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/images/swagat_central_transparent.png"
            alt="SwagCentral Logo"
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Center Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wide text-gray-800">
          <Link href="/" className="hover:text-[#ff5500] transition text-[#ff5500]">
            HOME
          </Link>
          <Link href="/shop" className="hover:text-[#ff5500] transition">
            SHOP
          </Link>
          <Link href="#categories-section" className="hover:text-[#ff5500] transition">
            CATEGORIES
          </Link>
          <Link href="#deals-section" className="hover:text-[#ff5500] transition">
            DEALS
          </Link>
        </nav>

        {/* Right Search and Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Search digital products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-xs bg-gray-100 rounded-full border border-gray-200 focus:outline-none focus:border-[#ff5500] focus:bg-white w-48 lg:w-60 transition"
            />
            <Search size={14} className="absolute left-3 text-gray-400" />
          </div>

          <Link
            href="/admin"
            title="Admin Login"
            className="p-2 text-gray-700 hover:text-[#ff5500] transition rounded-full hover:bg-gray-100"
          >
            <User size={20} />
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-gray-700 hover:text-[#ff5500] transition rounded-full hover:bg-gray-100 relative"
            aria-label="View Cart"
          >
            <ShoppingBag size={21} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff5500] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center font-unbounded">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-black"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3 animate-fadeIn">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-gray-100 rounded-lg border border-gray-200"
            />
          </div>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-bold border-b border-gray-50"
          >
            HOME
          </Link>
          <Link
            href="#products-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-bold border-b border-gray-50"
          >
            SHOP
          </Link>
          <Link
            href="#categories-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-bold"
          >
            CATEGORIES
          </Link>
        </div>
      )}
    </header>
  );
}
