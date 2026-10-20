"use client";

import React from "react";
import { Sparkles, Tag, ShieldCheck, Zap } from "lucide-react";

interface TickerStripProps {
  variant?: "yellow" | "green";
}

export default function TickerStrip({ variant = "yellow" }: TickerStripProps) {
  const isYellow = variant === "yellow";

  const items = isYellow
    ? [
        { icon: Sparkles, text: "100+ DIGITAL PRODUCTS" },
        { icon: Tag, text: "UP TO 75% OFF ALL BUNDLES" },
        { icon: Zap, text: "LIFETIME ACCESS ON SELECT BUNDLES" },
        { icon: ShieldCheck, text: "INSTANT ACCESS & EMAIL DELIVERY" },
      ]
    : [
        { icon: Sparkles, text: "NEW IN OUR STORE" },
        { icon: ShieldCheck, text: "100% READY-TO-SELL WITH RESELL RIGHTS" },
        { icon: Zap, text: "COMMERCIAL PLR & MRR INCLUDED" },
        { icon: Tag, text: "PRE-TESTED DIGITAL ASSETS" },
      ];

  const bgColor = isYellow
    ? "bg-[#eab308] text-black border-y border-amber-500/20"
    : "bg-[#84cc16] text-black border-y border-lime-600/20";

  return (
    <div className={`w-full ${bgColor} py-2.5 overflow-hidden select-none`}>
      <div className="flex animate-ticker whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-3 px-8 text-xs md:text-sm font-unbounded font-black tracking-wider uppercase"
            >
              <Icon size={16} className="text-black fill-black/20" />
              <span>{item.text}</span>
              <span className="opacity-40">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
