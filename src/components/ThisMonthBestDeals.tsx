"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

export default function ThisMonthBestDeals() {
  const deals = [
    {
      id: "deal-1",
      badge: "HUGE SALE!!",
      title: "AI PROMPT MEGA BUNDLE",
      subtitle: "2,000+ Tested Prompts for Claude, ChatGPT & Gemini",
      bgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      ctaText: "SHOP NOW",
      targetSlug: "ultimate-claude-bundle",
    },
    {
      id: "deal-2",
      badge: "AVAILABLE NOW",
      title: "CANVA TEMPLATE PACK",
      subtitle: "5,000+ Viral Posts, Reels Covers & Social Graphics",
      bgImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
      ctaText: "SHOP NOW",
      targetSlug: "canva-template-mega-pack",
    },
    {
      id: "deal-3",
      badge: "LIMITED OFFER",
      title: "BUY 2 GET 1 FREE! ALL PLR BUNDLES",
      subtitle: "Full Resell Rights Included. Keep 100% of profits",
      bgImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      ctaText: "SHOP NOW >",
      targetSlug: "millions-plr-digital-vault",
    },
  ];

  return (
    <section id="deals-section" className="w-full py-10 px-4 md:px-8 bg-[#fdfbf7]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Flame className="text-[#ff5500] fill-[#ff5500]" size={24} />
            <h2 className="font-unbounded font-black text-xl md:text-2xl text-gray-950 uppercase tracking-tight">
              THIS MONTH BEST DEALS!
            </h2>
          </div>
          <Link
            href="#products-section"
            className="text-xs font-bold text-[#ff5500] hover:underline flex items-center gap-1 font-unbounded"
          >
            VIEW ALL <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between min-h-[360px]"
            >
              {/* Background image with overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={deal.bgImage}
                  alt={deal.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>
              </div>

              {/* Top badge */}
              <div className="relative z-10 p-5">
                <span className="inline-block bg-[#ff5500] text-white text-[10px] font-unbounded font-black px-2.5 py-1 rounded tracking-widest uppercase">
                  {deal.badge}
                </span>
              </div>

              {/* Bottom content */}
              <div className="relative z-10 p-6 space-y-3">
                <h3 className="font-unbounded font-black text-lg md:text-xl text-white tracking-tight uppercase leading-snug">
                  {deal.title}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {deal.subtitle}
                </p>
                <div className="pt-2">
                  <Link
                    href="#products-section"
                    className="inline-flex items-center gap-2 bg-black hover:bg-[#ff5500] text-white font-unbounded font-bold text-xs px-6 py-2.5 rounded transition uppercase tracking-wider border border-white/20"
                  >
                    <span>{deal.ctaText}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
