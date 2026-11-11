"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Headphones } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#fdfbf7] text-gray-700 pt-16 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/images/logo.webp"
                alt="SwagCentral Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>

            <p className="text-xs text-gray-600 leading-relaxed max-w-sm">
              Digital products for creators, students and small businesses: AI prompt libraries, Canva templates, PLR bundles, eBooks and reels packs, delivered by email.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-gray-800">
                <MapPin size={15} className="text-[#ff5500] flex-shrink-0" />
                <span className="font-bold">GURGAON, HARYANA</span>
              </div>
              <div className="flex items-center gap-2 text-gray-800">
                <Phone size={15} className="text-[#ff5500] flex-shrink-0" />
                <a href="tel:+919821774565" className="hover:text-[#ff5500] font-bold">
                  +91 9821774565
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-800">
                <Mail size={15} className="text-[#ff5500] flex-shrink-0" />
                <a href="mailto:swagcentral012@gmail.com" className="hover:text-[#ff5500] font-bold">
                  swagcentral012@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/919821774565"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black hover:bg-[#ff5500] text-white text-xs font-unbounded font-bold px-4 py-2 rounded transition"
              >
                <Headphones size={14} />
                <span>HELP DESK (WHATSAPP)</span>
              </a>
            </div>
          </div>

          {/* Shop Col */}
          <div className="space-y-3">
            <h4 className="font-unbounded font-bold text-xs uppercase tracking-wider text-gray-950">
              Shop
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#products-section" className="hover:text-[#ff5500] transition">
                  AI TOOLS & PROMPTS
                </Link>
              </li>
              <li>
                <Link href="#products-section" className="hover:text-[#ff5500] transition">
                  BUSINESS & MARKETING
                </Link>
              </li>
              <li>
                <Link href="#products-section" className="hover:text-[#ff5500] transition">
                  EBOOKS & DIGITAL BOOKS
                </Link>
              </li>
              <li>
                <Link href="#products-section" className="hover:text-[#ff5500] transition">
                  CANVA TEMPLATES
                </Link>
              </li>
              <li>
                <Link href="#products-section" className="hover:text-[#ff5500] transition">
                  FITNESS & HEALTH
                </Link>
              </li>
              <li>
                <Link href="#products-section" className="hover:text-[#ff5500] transition">
                  MARKETING & SEO TOOLS
                </Link>
              </li>
              <li>
                <Link href="#products-section" className="hover:text-[#ff5500] transition">
                  VIDEO & REELS PACKS
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Info Col */}
          <div className="space-y-3">
            <h4 className="font-unbounded font-bold text-xs uppercase tracking-wider text-gray-950">
              Information
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-[#ff5500] transition">
                  ABOUT US
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#ff5500] transition">
                  ALL PRODUCTS
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-[#ff5500] transition">
                  FAQ & SUPPORT
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#ff5500] transition">
                  CONTACT
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Col */}
          <div className="space-y-3">
            <h4 className="font-unbounded font-bold text-xs uppercase tracking-wider text-gray-950">
              Account & Downloads
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/checkout" className="hover:text-[#ff5500] transition">
                  MY CART
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#ff5500] transition">
                  MY ORDERS & DOWNLOADS
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#ff5500] transition">
                  PRIVACY POLICY
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#ff5500] transition">
                  TERMS OF SERVICE
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#ff5500] transition">
                  REFUND POLICY
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods and Lower Bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="font-semibold text-gray-700">Supported Payments:</span>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-blue-600">VISA</span>
              <span>•</span>
              <span className="text-red-500">MasterCard</span>
              <span>•</span>
              <span className="text-emerald-600">UPI / GPay</span>
              <span>•</span>
              <span className="text-orange-600">RuPay</span>
              <span>•</span>
              <span className="text-blue-800">Net Banking</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-gray-500">
            <Link href="/terms" className="hover:underline">Terms of Use</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:underline">Refunds</Link>
            <Link href="/accessibility" className="hover:underline">Accessibility</Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
          Copyright © 2026 SwagCentral. All Rights Reserved. Payments secured by PayU.
        </div>
      </div>
    </footer>
  );
}
