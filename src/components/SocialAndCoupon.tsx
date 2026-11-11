"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Sparkles } from "lucide-react";
import { SITE } from "@/lib/site";

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

interface FeaturedCoupon {
  code: string;
  label: string;
  description?: string;
}

const socialLinks = [
  { href: SITE.social.instagram, label: "INSTAGRAM", Icon: InstagramIcon },
  { href: SITE.social.facebook, label: "FACEBOOK", Icon: FacebookIcon },
].filter((s) => s.href);

export default function SocialAndCoupon() {
  const [coupon, setCoupon] = useState<FeaturedCoupon | null>(null);
  const [copied, setCopied] = useState(false);

  // The banner shows the coupon marked "Show on homepage" in the admin panel, if any
  useEffect(() => {
    fetch("/api/coupons/featured")
      .then((res) => res.json())
      .then((data) => setCoupon(data.coupon || null))
      .catch(() => setCoupon(null));
  }, []);

  const copyCode = async () => {
    if (!coupon) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the code is still visible to type in
    }
  };

  if (!coupon && socialLinks.length === 0) return null;

  return (
    <div className="w-full">
      {socialLinks.length > 0 && (
        <section className="py-12 px-4 md:px-8 text-center bg-white border-t border-gray-100">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-unbounded font-black text-2xl md:text-3xl text-gray-950 uppercase tracking-tight">
              FOLLOW US ON SOCIAL MEDIA
            </h2>
            <p className="text-xs text-gray-500 font-semibold">Get discount codes and new bundles first.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black hover:bg-[#ff5500] text-white font-unbounded font-bold text-xs px-6 py-2.5 rounded transition uppercase tracking-wider shadow-sm"
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {coupon && (
        <section className="w-full bg-gradient-to-r from-[#941c00] via-[#c23600] to-[#801400] text-white py-14 px-4 md:px-8 relative overflow-hidden text-center shadow-inner">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="max-w-3xl mx-auto relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-yellow-300 border border-white/10">
              <Sparkles size={14} />
              <span>SPECIAL OFFER</span>
            </div>

            <h2 className="font-unbounded font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight uppercase leading-tight">
              {coupon.label}
            </h2>
            {coupon.description && (
              <p className="font-unbounded font-bold text-sm sm:text-base text-yellow-200 uppercase tracking-wider">
                {coupon.description}
              </p>
            )}

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="font-unbounded font-black text-2xl text-white bg-black/50 px-5 py-2 rounded-lg border border-dashed border-yellow-400 select-all tracking-widest">
                {coupon.code}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-2 bg-black hover:bg-white hover:text-black text-white font-unbounded font-bold text-xs px-5 py-3 rounded-lg uppercase tracking-wider transition border border-white/20"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>
            <p className="text-xs text-gray-200">
              Apply it on the <Link href="/checkout" className="underline font-semibold">checkout page</Link>.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
