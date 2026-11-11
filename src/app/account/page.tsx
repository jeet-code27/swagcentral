import React from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountClient from "@/app/account/AccountClient";

export const metadata: Metadata = {
  title: "My Orders | SwagCentral",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Header />
      <AccountClient />
      <Footer />
    </div>
  );
}
