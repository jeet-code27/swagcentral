"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, DollarSign, CheckCircle } from "lucide-react";
import TickerStrip from "./TickerStrip";

export default function StartBusinessBanner() {
  return (
    <div className="w-full">
      <section className="relative w-full bg-[#0a0f0d] text-white overflow-hidden py-14 md:py-20 px-4 md:px-8 border-t border-gray-800">
        {/* Glow */}
        <div className="absolute top-1/2 left-10 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-lime-950/80 text-lime-400 border border-lime-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <DollarSign size={14} />
              <span>KEEP 100% OF THE PROFIT</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-unbounded font-black text-3xl sm:text-4xl md:text-5xl text-lime-400 tracking-tight leading-tight">
                LOOKING TO START YOUR DIGITAL BUSINESS?
              </h2>
              <p className="font-unbounded font-semibold text-sm sm:text-base md:text-lg text-gray-300">
                Check our 100% ready-to-sell PLR & Reseller bundles
              </p>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
              Get lifetime commercial and master resell rights (MRR) to courses, Canva templates, AI prompt vaults, and video reels. Download once, rebrand, and sell unlimited times on Instagram, WhatsApp, or your own site.
            </p>

            <div className="pt-2">
              <Link
                href="#products-section"
                className="inline-flex items-center gap-2 bg-white hover:bg-lime-400 hover:text-black text-gray-950 font-unbounded font-black px-8 py-3.5 rounded text-xs tracking-wider uppercase transition shadow-xl"
              >
                <span>SHOP NOW</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Visual Collage */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md bg-gradient-to-tr from-gray-950 to-gray-900 border border-lime-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <span className="font-unbounded font-bold text-xs text-lime-400">
                    PLR RESELLER LICENSE INCLUDED
                  </span>
                  <ShieldCheck size={18} className="text-lime-400" />
                </div>

                <div className="space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-lime-400" />
                    <span>Unrestricted Master Resell Rights (MRR)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-lime-400" />
                    <span>Ready-to-post sales copy & mockups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-lime-400" />
                    <span>Google Drive access with 100k+ assets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-lime-400" />
                    <span>No royalties or monthly subscriptions</span>
                  </div>
                </div>

                <div className="p-3 bg-lime-950/40 border border-lime-500/20 rounded-xl mt-4 flex items-center justify-between">
                  <span className="font-unbounded text-xs font-bold text-white">
                    Starter Bundle Special
                  </span>
                  <span className="font-unbounded text-base font-black text-lime-400">
                    ₹299 Only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Green Ticker directly below banner matching screenshot page 2 */}
      <TickerStrip variant="green" />
    </div>
  );
}
