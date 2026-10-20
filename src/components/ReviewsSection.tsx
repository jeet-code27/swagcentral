"use client";

import React from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { REVIEWS } from "@/data/mockData";

export default function ReviewsSection() {
  return (
    <section className="w-full py-14 px-4 md:px-8 bg-[#fdfbf7] border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-left mb-10">
          <h2 className="font-unbounded font-black text-xl md:text-2xl text-gray-950 uppercase tracking-tight">
            LATEST REVIEWS
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Real feedback from verified digital product customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* 5 Stars */}
                <div className="flex text-[#ff5500]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} className="fill-[#ff5500] text-[#ff5500]" />
                  ))}
                </div>

                {/* Review Headline in uppercase */}
                <h4 className="font-unbounded font-bold text-xs md:text-sm text-gray-900 leading-snug uppercase">
                  &ldquo;{rev.title}&rdquo;
                </h4>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {rev.review}
                </p>
              </div>

              {/* Author & Verification */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-gray-800">{rev.name}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                  <CheckCircle2 size={13} />
                  <span>Verified Buyer</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
