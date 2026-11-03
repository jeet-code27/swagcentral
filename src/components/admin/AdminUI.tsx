"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { cdnImage } from "@/lib/image";

export const inputClass =
  "w-full bg-[#0a0f1d] border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff5500]";

export function PageHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  actions,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white font-semibold"
      >
        <ArrowLeft size={14} /> {backLabel}
      </Link>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-unbounded font-black text-xl md:text-2xl text-white tracking-tight uppercase break-words">
            {title}
          </h1>
          {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-[#131b2e] border border-gray-800 rounded-2xl p-5 md:p-6 space-y-4 ${className}`}>
      {title && <h2 className="font-unbounded font-bold text-xs text-white uppercase tracking-wide">{title}</h2>}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-[11px] font-semibold text-gray-300">
        {label} {required && <span className="text-[#ff5500]">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[10px] text-gray-500">{hint}</span>}
    </label>
  );
}

export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-gray-800/70 last:border-0">
      <dt className="text-[11px] font-semibold text-gray-400 sm:w-40 flex-shrink-0">{label}</dt>
      <dd className="text-xs text-gray-100 min-w-0 break-words">{children}</dd>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={28} className="animate-spin text-[#ff5500]" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-950/60 text-red-300 border border-red-800 rounded-xl text-xs">{message}</div>
  );
}

export const primaryButton =
  "inline-flex items-center gap-1.5 bg-[#ff5500] hover:bg-[#e04b00] disabled:bg-gray-700 disabled:text-gray-400 text-white text-[11px] font-unbounded font-bold px-4 py-2.5 rounded-lg transition uppercase";
export const secondaryButton =
  "inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-bold px-4 py-2.5 rounded-lg transition";

/**
 * Uploads images to Cloudinary through /api/admin/upload.
 * The first image is the main (thumbnail) image.
 */
export function ImageListInput({
  images,
  onChange,
  folder = "products",
  single = false,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: "products" | "categories";
  single?: boolean;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlDraft, setUrlDraft] = useState("");

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploaded.push(data.url);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      if (uploaded.length) onChange(single ? [uploaded[0]] : [...images, ...uploaded]);
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const addUrl = () => {
    const url = urlDraft.trim();
    if (!/^https?:\/\//.test(url)) {
      setError("Enter a full image URL starting with https://");
      return;
    }
    onChange(single ? [url] : [...images, url]);
    setUrlDraft("");
    setError("");
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={url + i} className="relative group rounded-xl overflow-hidden border border-gray-700 bg-neutral-950 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdnImage(url, 300)} alt="" className="w-full h-full object-contain" />
              {!single && i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-[#ff5500] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  MAIN
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-1.5 flex justify-end gap-1 bg-gradient-to-t from-black/80 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                {!single && i > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange([url, ...images.filter((_, j) => j !== i)])}
                    className="p-1.5 bg-black/70 rounded text-yellow-400 hover:text-yellow-300"
                    title="Make main image"
                  >
                    <Star size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, j) => j !== i))}
                  className="p-1.5 bg-black/70 rounded text-red-400 hover:text-red-300"
                  title="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className={secondaryButton + " justify-center"}
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {uploading ? "Uploading..." : single && images.length ? "Replace Image" : "Upload Image"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple={!single}
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <div className="flex flex-1 gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="...or paste an image URL"
            className={inputClass}
          />
          <button type="button" onClick={addUrl} className={secondaryButton}>
            Add
          </button>
        </div>
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
