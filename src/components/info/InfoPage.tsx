import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/** Shared layout for About, Contact, Help and policy pages. */
export default function InfoPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <nav className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#ff5500]">
            Home
          </Link>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-900">{title}</span>
        </nav>
        <h1 className="font-unbounded font-black text-2xl md:text-4xl uppercase text-gray-950 tracking-tight">{title}</h1>
        {intro && <p className="text-base text-gray-600 mt-3 leading-relaxed">{intro}</p>}
        {updated && <p className="text-xs text-gray-400 mt-2">Last updated: {updated}</p>}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-10 text-[15px] leading-relaxed text-gray-700 space-y-4 [&_h2]:font-unbounded [&_h2]:font-bold [&_h2]:text-lg [&_h2]:text-gray-950 [&_h2]:pt-4 [&_h2:first-child]:pt-0 [&_h3]:font-bold [&_h3]:text-gray-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[#ff5500] [&_a]:font-semibold hover:[&_a]:underline">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
