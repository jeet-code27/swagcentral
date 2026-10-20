"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import TickerStrip from "@/components/TickerStrip";
import ShopByCategory from "@/components/ShopByCategory";
import ThisMonthBestDeals from "@/components/ThisMonthBestDeals";
import ProductShowcaseTabs from "@/components/ProductShowcaseTabs";
import StartBusinessBanner from "@/components/StartBusinessBanner";
import TrendingProducts from "@/components/TrendingProducts";
import SaveMoreDeals from "@/components/SaveMoreDeals";
import ReviewsSection from "@/components/ReviewsSection";
import SocialAndCoupon from "@/components/SocialAndCoupon";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

interface HomeClientProps {
  initialProducts?: any[];
  initialCategories?: any[];
}

export default function HomeClient({
  initialProducts,
  initialCategories,
}: HomeClientProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      {/* 1. Top Header */}
      <Header />

      {/* 2. Hero Banner with Slider */}
      <HeroBanner />

      {/* 3. Yellow Ticker */}
      <TickerStrip variant="yellow" />

      {/* 4. Shop By Category (Direct Category Page Navigation) */}
      <ShopByCategory categories={initialCategories} />

      {/* 5. This Month Best Deals (3 Promo Cards) */}
      <ThisMonthBestDeals />

      {/* 6. Product Showcase Tabs (New Arrivals, Best Sellers, On Sale from DB) */}
      <ProductShowcaseTabs products={initialProducts} />

      {/* 7. Start Digital Business Banner + Green Ticker */}
      <StartBusinessBanner />

      {/* 8. Trending Digital Products Grid */}
      <TrendingProducts products={initialProducts} />

      {/* 9. Save More With Best Deals */}
      <SaveMoreDeals />

      {/* 10. Customer Reviews */}
      <ReviewsSection />

      {/* 11. Social & First Purchase Coupon */}
      <SocialAndCoupon />

      {/* 12. Complete Footer */}
      <Footer />

      {/* 13. Slide-over Cart & Checkout Drawer */}
      <CartDrawer />
    </div>
  );
}
