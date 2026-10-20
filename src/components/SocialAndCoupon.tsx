"use client";

import React, { useState } from "react";
import { Tag, Check, Sparkles } from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export default function SocialAndCoupon() {
  const [email, setEmail] = useState("");
  const [couponRevealed, setCouponRevealed] = useState(false);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setCouponRevealed(true);
    }
  };

  return (
    <div className="w-full">
      {/* Social section */}
      <section className="py-12 px-4 md:px-8 text-center bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="font-unbounded font-black text-2xl md:text-3xl text-gray-950 uppercase tracking-tight">
            FOLLOW US ON SOCIAL MEDIA
          </h2>
          <p className="text-xs text-gray-500 font-semibold">
            Get great discount codes and follow promotions!
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black hover:bg-[#ff5500] text-white font-unbounded font-bold text-xs px-6 py-2.5 rounded transition uppercase tracking-wider shadow-sm"
            >
              <InstagramIcon size={16} />
              <span>INSTAGRAM</span>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black hover:bg-[#ff5500] text-white font-unbounded font-bold text-xs px-6 py-2.5 rounded transition uppercase tracking-wider shadow-sm"
            >
              <FacebookIcon size={16} />
              <span>FACEBOOK</span>
            </a>
          </div>
        </div>
      </section>

      {/* Coupon banner */}
      <section className="w-full bg-gradient-to-r from-[#941c00] via-[#c23600] to-[#801400] text-white py-14 px-4 md:px-8 relative overflow-hidden text-center shadow-inner">
        {/* Glowing pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-yellow-300 border border-white/10">
            <Sparkles size={14} />
            <span>LIMITED TIME WELCOME OFFER</span>
          </div>

          <h3 className="font-unbounded font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight uppercase leading-tight">
            DON&apos;T MISS!! ₹500 ($10) COUPON
          </h3>
          <p className="font-unbounded font-bold text-sm sm:text-base text-yellow-200 uppercase tracking-wider">
            FOR YOUR FIRST PURCHASE
          </p>

          {!couponRevealed ? (
            <form
              onSubmit={handleClaim}
              className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Enter your email for instant coupon..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
              />
              <button
                type="submit"
                className="w-full sm:w-auto flex-shrink-0 bg-black hover:bg-white hover:text-black text-white font-unbounded font-bold text-xs px-6 py-3 rounded-lg uppercase tracking-wider transition shadow-xl border border-white/20"
              >
                GET THE COUPON
              </button>
            </form>
          ) : (
            <div className="pt-4 max-w-md mx-auto bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/20 space-y-2">
              <span className="text-xs text-yellow-300 font-bold uppercase tracking-wider">
                Coupon Code Unlocked:
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-unbounded font-black text-2xl text-white bg-black/60 px-4 py-1.5 rounded-lg border border-dashed border-yellow-400 select-all">
                  SWAG500
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                Use code <strong>SWAG500</strong> at checkout for instant ₹500 off on bundles!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
