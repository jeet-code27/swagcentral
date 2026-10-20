"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image,
  Database,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function WordPressImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadToCloudinary, setUploadToCloudinary] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<{ imported: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select a WordPress export file (.xml or .csv).");
      return;
    }

    startImportProcess(file, null);
  };

  const handleTestSampleImport = () => {
    const sampleBatch = [
      {
        title: "20,000+ Viral Reels Super Bundle – 4K Ultra HD",
        slug: "20k-viral-reels-super-bundle",
        category: "Video & Reels Packs",
        price: 399,
        originalPrice: 1499,
        description: "Massive collection of viral motivational, fitness, luxury, and AI reels with 100% resell rights.",
        wpImageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
        accessUrl: "https://drive.google.com/drive/folders/sample-reels-import",
        pdfFileName: "Claude_Bundle_Starter_Guide.pdf",
      },
      {
        title: "ChatGPT & Midjourney Prompt Engineering Masterclass",
        slug: "prompt-engineering-masterclass",
        category: "AI Tools & Prompts",
        price: 299,
        originalPrice: 999,
        description: "Learn how to write multi-shot prompts that generate high-converting landing pages and 3D graphics.",
        wpImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        accessUrl: "https://drive.google.com/drive/folders/prompt-masterclass",
        pdfFileName: "ChatGPT_Ultimate_Marketer_Handbook.pdf",
      },
      {
        title: "Complete Digital Marketing Agency Starter Toolkit",
        slug: "agency-starter-toolkit",
        category: "Marketing & SEO Tools",
        price: 499,
        originalPrice: 2499,
        description: "Includes client contracts, proposal decks, invoice templates, and cold email sequences.",
        wpImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        accessUrl: "https://drive.google.com/drive/folders/agency-toolkit",
      },
    ];

    startImportProcess(null, JSON.stringify(sampleBatch));
  };

  const startImportProcess = async (fileObj: File | null, jsonPayload: string | null) => {
    setIsImporting(true);
    setErrorMsg("");
    setLogs(["Starting import pipeline...", "Validating payloads & schemas..."]);
    setStats(null);

    try {
      const formData = new FormData();
      if (fileObj) formData.append("file", fileObj);
      if (jsonPayload) formData.append("json", jsonPayload);
      formData.append("uploadToCloudinary", uploadToCloudinary.toString());

      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setLogs((prev) => [...prev, ...(data.logs || []), "🎉 Import Pipeline Completed Successfully!"]);
      setStats({ imported: data.importedCount, total: data.totalParsed });
    } catch (err) {
      setErrorMsg((err as Error).message);
      setLogs((prev) => [...prev, `❌ Error: ${(err as Error).message}`]);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-unbounded font-black text-2xl md:text-3xl text-white tracking-tight uppercase">
          WORDPRESS BULK IMPORTER
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Export products from WordPress/WooCommerce and automatically sync products to MongoDB & images to Cloudinary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-7 bg-[#131b2e] border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6">
          <form onSubmit={handleImport} className="space-y-5">
            <div>
              <label className="block font-unbounded text-xs font-bold text-gray-200 uppercase mb-2">
                WordPress Export File (.xml or .csv)
              </label>

              <div className="border-2 border-dashed border-gray-700 hover:border-[#ff5500] rounded-xl p-6 text-center transition bg-gray-900/40 relative">
                <input
                  type="file"
                  accept=".xml,.csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 text-[#ff5500] flex items-center justify-center">
                    <UploadCloud size={24} />
                  </div>
                  <span className="text-xs font-semibold text-gray-200">
                    {file ? file.name : "Click to select or drag and drop WP Export file"}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Supports WordPress WXR (.xml) & WooCommerce Products (.csv)
                  </span>
                </div>
              </div>
            </div>

            {/* Checkbox for Cloudinary sync */}
            <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadToCloudinary}
                  onChange={(e) => setUploadToCloudinary(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#ff5500] rounded focus:ring-0"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 font-unbounded">
                    <Image size={14} className="text-[#ff5500]" />
                    Auto-Upload WP Images to Cloudinary
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Downloads images from WordPress media URLs and hosts them on Cloudinary CDN for instant loading.
                  </p>
                </div>
              </label>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/60 text-red-300 border border-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isImporting || !file}
                className="flex-1 bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-gray-700 text-white font-unbounded font-bold text-xs py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Migrating to Cloudinary & MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    <span>Start WordPress Import</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestSampleImport}
                disabled={isImporting}
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-unbounded font-semibold text-xs py-3 px-4 rounded-xl transition uppercase"
              >
                Test 1-Click Sample Import
              </button>
            </div>
          </form>
        </div>

        {/* Realtime Live Terminal / Progress View */}
        <div className="lg:col-span-5 bg-[#0a0f1d] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="font-unbounded font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Migration Terminal
              </span>
              {stats && (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  {stats.imported}/{stats.total} Imported
                </span>
              )}
            </div>

            <div className="bg-black/60 rounded-xl p-4 font-mono text-[11px] text-gray-300 h-64 overflow-y-auto space-y-1.5 border border-gray-900">
              {logs.length === 0 ? (
                <span className="text-gray-500 italic">
                  Select a WordPress file and click import to see live progress...
                </span>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.startsWith("✓")
                        ? "text-emerald-400"
                        : log.startsWith("❌")
                        ? "text-red-400"
                        : log.startsWith("[Cloudinary]")
                        ? "text-amber-300"
                        : "text-gray-300"
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Target: MongoDB & Cloudinary</span>
            <Link
              href="/"
              className="text-[#ff5500] font-bold hover:underline flex items-center gap-1 font-unbounded text-[11px]"
            >
              <span>View Live Store</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
