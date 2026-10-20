"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  ExternalLink,
  Download,
  Mail,
  Zap,
  ArrowLeft,
  ShieldCheck,
  Headphones,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


function DownloadContent() {
  const params = useParams();
  const token = params?.token as string;
  const [downloadItems, setDownloadItems] = useState<any[]>([]);

  useEffect(() => {
    // Shoot celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore if canvas-confetti is not loaded
    }

    // Load from DB or default mock items
    fetch(`/api/order/status?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.order && data.order.items) {
          setDownloadItems(data.order.items);
        } else {
          // Fallback demo items
          setDownloadItems([
            {
              title: "The Ultimate Claude Bundle – 2,000+ Skills & Agents",
              price: 499,
              deliveryType: "both",
              accessUrl: "https://drive.google.com/drive/folders/swagcentral-demo",
              pdfFileName: "Claude_Bundle_Starter_Guide.pdf",
              thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
            },
          ]);
        }
      })
      .catch(() => {
        // Fallback demo
        setDownloadItems([
          {
            title: "The Ultimate Claude Bundle – 2,000+ Skills & Agents",
            price: 499,
            deliveryType: "both",
            accessUrl: "https://drive.google.com/drive/folders/swagcentral-demo",
            pdfFileName: "Claude_Bundle_Starter_Guide.pdf",
            thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
          },
        ]);
      });
  }, [token]);

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
      {/* Success Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#111111] text-white p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle size={36} />
          </div>

          <h1 className="font-unbounded font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
            PAYMENT CONFIRMED!
          </h1>
          <p className="font-unbounded font-bold text-xs sm:text-sm text-[#ff5500] uppercase mt-1 tracking-wider">
            YOUR DIGITAL PRODUCTS ARE READY
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs text-gray-200">
            <Mail size={14} className="text-yellow-400" />
            <span>We also sent a backup access copy to your email inbox!</span>
          </div>
        </div>

        {/* Product Items Access Box */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-unbounded font-bold text-sm text-gray-900 uppercase">
              Your Purchased Digital Bundles
            </h2>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck size={14} /> Lifetime Access Granted
            </span>
          </div>

          <div className="space-y-4">
            {downloadItems.map((item, index) => (
              <div
                key={index}
                className="p-5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-contain bg-neutral-950 flex-shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-unbounded font-bold text-sm text-gray-950">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Format:{" "}
                      {item.deliveryType === "pdf"
                        ? "Direct PDF Guide"
                        : item.deliveryType === "both"
                        ? "Drive Cloud Folder + PDF"
                        : "Google Drive / Canva Link"}
                    </p>
                  </div>
                </div>

                {/* Access Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {item.accessUrl && (
                    <a
                      href={item.accessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#ff5500] hover:bg-[#e04b00] text-white text-xs font-unbounded font-bold px-4 py-2.5 rounded-lg transition shadow uppercase"
                    >
                      <ExternalLink size={14} />
                      <span>Open Drive Link</span>
                    </a>
                  )}

                  {item.pdfFileName && (
                    <a
                      href={`/api/download/file?file=${item.pdfFileName}`}
                      download
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-unbounded font-bold px-4 py-2.5 rounded-lg transition shadow uppercase"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Support Help box */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="space-y-0.5">
              <span className="font-bold flex items-center gap-1.5">
                <Headphones size={15} className="text-[#ff5500]" />
                Need help downloading or extracting files?
              </span>
              <p className="text-amber-800 text-[11px]">
                Our support team is available on WhatsApp +91 9821774565 or email swagcentral012@gmail.com
              </p>
            </div>
            <a
              href="https://wa.me/919821774565"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-4 py-2 rounded-lg font-unbounded font-bold text-[11px] whitespace-nowrap"
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-unbounded font-bold text-gray-700 hover:text-[#ff5500] transition uppercase"
            >
              <ArrowLeft size={14} />
              <span>Return to SwagCentral Store</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-20 text-gray-500">
            <Loader2 size={32} className="animate-spin text-[#ff5500]" />
          </div>
        }
      >
        <DownloadContent />
      </Suspense>
      <Footer />
    </div>
  );
}
