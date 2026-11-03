import React from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutClient from "@/app/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | SwagCentral",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Header />
      <CheckoutClient />
      <Footer />
    </div>
  );
}
