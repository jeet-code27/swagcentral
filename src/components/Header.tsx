"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, ShoppingBag, Phone, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { trackPixel } from "@/lib/metaPixel";

export default function Header() {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Search runs on the Shop page, which reads ?q=
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setMobileMenuOpen(false);
    if (q) trackPixel("Search", { search_string: q });
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

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
            <Link href="/account" className="hover:text-white transition">My Orders</Link>
            <Link href="/help" className="hover:text-white transition">Help</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <span className="hidden md:inline text-gray-600">|</span>
            <span className="hidden md:inline font-bold text-white">INR (₹)</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/images/logo.webp"
            alt="SwagCentral Logo"
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Center Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wide text-gray-800">
          {/* Reading the URL needs Suspense on dynamic pages; the fallback is the same links without highlight */}
          <Suspense fallback={<NavLinks pathname="" />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>

        {/* Right Search and Actions */}
        <div className="flex items-center gap-4">
          <form onSubmit={submitSearch} role="search" className="hidden md:flex items-center relative">
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search digital products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-xs bg-gray-100 rounded-full border border-gray-200 focus:outline-none focus:border-[#ff5500] focus:bg-white w-48 lg:w-60 transition"
            />
            <Search size={14} className="absolute left-3 text-gray-400" />
          </form>

          <Link
            href="/account"
            title="My Orders"
            aria-label="My Orders"
            className="p-2 text-gray-700 hover:text-[#ff5500] transition rounded-full hover:bg-gray-100"
          >
            <User size={20} />
          </Link>

          <Link
            href="/checkout"
            className="p-2 text-gray-700 hover:text-[#ff5500] transition rounded-full hover:bg-gray-100 relative"
            aria-label="View Cart"
          >
            <ShoppingBag size={21} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff5500] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center font-unbounded">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden p-2 text-gray-700 hover:text-black"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3 animate-fadeIn">
          <form onSubmit={submitSearch} role="search" className="mb-3 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:border-[#ff5500]"
            />
          </form>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-bold border-b border-gray-50"
          >
            HOME
          </Link>
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-bold border-b border-gray-50"
          >
            SHOP
          </Link>
          <Link
            href="/#categories-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-bold border-b border-gray-50"
          >
            CATEGORIES
          </Link>
          <Link
            href="/account"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-800 font-bold"
          >
            MY ORDERS
          </Link>
        </div>
      )}
    </header>
  );
}

const NAV_LINKS = [
  { href: "/", label: "HOME", isActive: (p: string) => p === "/" },
  { href: "/shop", label: "SHOP", isActive: (p: string) => p.startsWith("/shop") },
  { href: "/#categories-section", label: "CATEGORIES", isActive: () => false },
  { href: "/#deals-section", label: "DEALS", isActive: () => false },
];

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`hover:text-[#ff5500] transition ${link.isActive(pathname) ? "text-[#ff5500]" : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}
