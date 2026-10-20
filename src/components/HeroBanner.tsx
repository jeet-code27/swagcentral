"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export default function HeroBanner() {
  const slides = [
    {
      id: 1,
      image: "/images/hero-banner2.png",
      badge: "2026 MEGA DIGITAL SALE",
      titleTop: "UP TO",
      discount: "-40%",
      subhead: "FOR ALL DIGITAL PRODUCTS",
      tags: [
        "AI PROMPTS",
        "CANVA TEMPLATES",
        "DIGITAL TOOLS",
        "EBOOKS",
        "CREATIVE RESOURCES",
      ],
      ctaText: "SHOP NOW",
      ctaLink: "#products-section",
    },
    {
      id: 2,
      image: "/images/hero-banner3 (2).png",
      badge: "100% MASTER RESELL RIGHTS",
      titleTop: "START YOUR",
      discount: "DIGITAL BIZ",
      subhead: "100,000+ READY-TO-SELL PLR VAULT",
      tags: [
        "REEL PACKS",
        "SEO BACKLINKS",
        "PROMPT LIBRARIES",
        "E-COM KITS",
        "GRAPHIC BUNDLES",
      ],
      ctaText: "EXPLORE BUNDLES",
      ctaLink: "#products-section",
    },
  ];

  const [current, setCurrent] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full overflow-hidden min-h-[500px] md:min-h-[580px] flex items-center bg-[#0d1117]">
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.subhead}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Gradient Overlays for contrast & text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 md:to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            {/* Content Box */}
            <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-center px-6 md:px-12 py-16">
              <div className="max-w-2xl space-y-5 text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-[#ff5500]/25 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold tracking-wider text-yellow-300 border border-[#ff5500]/40 w-max shadow-lg">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span>{slide.badge}</span>
                </div>

                {/* Typography */}
                <div className="space-y-1">
                  <h2 className="font-unbounded font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white drop-shadow-md">
                    {slide.titleTop}
                  </h2>
                  <div className="font-unbounded font-black text-5xl sm:text-6xl md:text-7xl tracking-tighter text-white drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-100 to-[#ff5500]">
                    {slide.discount}
                  </div>
                  <p className="font-unbounded font-bold text-base sm:text-xl md:text-2xl tracking-wider text-gray-100 uppercase drop-shadow-md">
                    {slide.subhead}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {slide.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-black/50 backdrop-blur-md text-white text-[11px] md:text-xs font-bold px-3 py-1 rounded border border-white/20 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="pt-3">
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 bg-[#ff5500] hover:bg-[#e04b00] text-white font-unbounded font-black px-8 py-3.5 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition text-xs md:text-sm tracking-wider uppercase border border-white/20"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#ff5500] text-white flex items-center justify-center transition border border-white/20 backdrop-blur-md shadow-xl"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#ff5500] text-white flex items-center justify-center transition border border-white/20 backdrop-blur-md shadow-xl"
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Indicators Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full h-2.5 ${
              idx === current ? "w-8 bg-[#ff5500]" : "w-2.5 bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
