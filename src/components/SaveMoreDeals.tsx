"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SaveMoreDeals() {
  return (
    <section className="w-full py-12 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-unbounded font-black text-xl md:text-2xl text-gray-950 uppercase tracking-tight">
            SAVE MORE WITH BEST DEALS
          </h2>
          <div className="w-12 h-1 bg-[#ff5500] mx-auto mt-2 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deal 1 */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-950 min-h-[380px] flex flex-col justify-end p-8 border border-gray-800 group">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=70"
              loading="lazy"
              alt="AI Prompts on Sale"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

            <div className="relative z-10 space-y-4">
              <span className="bg-[#ff5500] text-white text-[10px] font-unbounded font-black px-3 py-1 rounded uppercase tracking-widest inline-block">
                UP TO 75% OFF
              </span>
              <h3 className="font-unbounded font-black text-2xl md:text-3xl text-white uppercase leading-snug">
                ALL AI PROMPT BUNDLES ON SALE
              </h3>
              <p className="text-xs text-gray-300 max-w-md">
                Over 25,000+ hand-crafted prompts for Claude 3.5, Midjourney, ChatGPT, and marketing automations.
              </p>
              <div>
                <Link
                  href="#products-section"
                  className="inline-flex items-center gap-2 bg-black hover:bg-[#ff5500] text-white font-unbounded font-bold text-xs px-6 py-3 rounded uppercase tracking-wider transition border border-white/20"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Deal 2 */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-950 min-h-[380px] flex flex-col justify-end p-8 border border-gray-800 group">
            <img
              src="https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=70"
              loading="lazy"
              alt="Canva Template Packs"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

            <div className="relative z-10 space-y-4">
              <span className="bg-emerald-600 text-white text-[10px] font-unbounded font-black px-3 py-1 rounded uppercase tracking-widest inline-block">
                BUNDLE SPECIAL
              </span>
              <h3 className="font-unbounded font-black text-2xl md:text-3xl text-white uppercase leading-snug">
                CANVA TEMPLATE PACKS — BUY 2 GET 1 FREE!
              </h3>
              <p className="text-xs text-gray-300 max-w-md">
                Complete aesthetic templates for social media, coach carousels, invoices, and brand kits.
              </p>
              <div>
                <Link
                  href="#products-section"
                  className="inline-flex items-center gap-2 bg-black hover:bg-[#ff5500] text-white font-unbounded font-bold text-xs px-6 py-3 rounded uppercase tracking-wider transition border border-white/20"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
