"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import {
  Card,
  ErrorState,
  Field,
  ImageListInput,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/admin/AdminUI";

export interface ProductFormValues {
  title: string;
  slug: string;
  category: string;
  price: string;
  originalPrice: string;
  badge: string;
  shortDescription: string;
  description: string;
  images: string[];
  deliveryType: "link" | "pdf" | "both";
  accessUrl: string;
  pdfFileName: string;
  features: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  rating: string;
  reviewCount: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  isTrending: boolean;
  status: "active" | "draft";
}

export const emptyProductForm: ProductFormValues = {
  title: "",
  slug: "",
  category: "",
  price: "",
  originalPrice: "",
  badge: "",
  shortDescription: "",
  description: "",
  images: [],
  deliveryType: "link",
  accessUrl: "",
  pdfFileName: "",
  features: "",
  tags: "",
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  rating: "5",
  reviewCount: "0",
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isOnSale: false,
  isTrending: false,
  status: "active",
};

/** Converts a product document from the API into form values. */
export function productToForm(p: Record<string, unknown>): ProductFormValues {
  const s = (v: unknown) => (v === undefined || v === null ? "" : String(v));
  const thumbnail = s(p.thumbnail);
  const images = Array.isArray(p.images) ? (p.images as string[]) : [];
  return {
    ...emptyProductForm,
    title: s(p.title),
    slug: s(p.slug),
    category: s(p.category),
    price: s(p.price),
    originalPrice: s(p.originalPrice),
    badge: s(p.badge),
    shortDescription: s(p.shortDescription),
    description: s(p.description),
    images: thumbnail ? [thumbnail, ...images.filter((u) => u !== thumbnail)] : images,
    deliveryType: (p.deliveryType as ProductFormValues["deliveryType"]) || "link",
    accessUrl: s(p.accessUrl),
    pdfFileName: s(p.pdfFileName),
    features: Array.isArray(p.features) ? (p.features as string[]).join("\n") : "",
    tags: Array.isArray(p.tags) ? (p.tags as string[]).join(", ") : "",
    metaTitle: s(p.metaTitle),
    metaDescription: s(p.metaDescription),
    focusKeyword: s(p.focusKeyword),
    rating: s(p.rating ?? 5),
    reviewCount: s(p.reviewCount ?? 0),
    isFeatured: !!p.isFeatured,
    isNewArrival: !!p.isNewArrival,
    isBestSeller: !!p.isBestSeller,
    isOnSale: !!p.isOnSale,
    isTrending: !!p.isTrending,
    status: p.status === "draft" ? "draft" : "active",
  };
}

const FLAGS: { key: keyof ProductFormValues; label: string }[] = [
  { key: "isFeatured", label: "Featured" },
  { key: "isNewArrival", label: "New Arrival" },
  { key: "isBestSeller", label: "Best Seller" },
  { key: "isOnSale", label: "On Sale" },
  { key: "isTrending", label: "Trending" },
];

export default function ProductForm({
  initial,
  productId,
}: {
  initial: ProductFormValues;
  /** When set, the form updates this product; otherwise it creates a new one. */
  productId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const price = parseFloat(values.price);
  const original = parseFloat(values.originalPrice);
  const discount =
    Number.isFinite(price) && Number.isFinite(original) && original > price
      ? Math.round(((original - price) / original) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          thumbnail: values.images[0] || "",
          features: values.features.split("\n"),
          tags: values.tags.split(","),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");
      router.push(`/admin/products/${data.product._id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      <div className="xl:col-span-2 space-y-6">
        <Card title="Basic Details">
          <Field label="Product Title" required>
            <input
              required
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputClass}
              placeholder="e.g. Ultimate Canva Template Mega Pack"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="URL Slug" hint="Leave empty to create it from the title. Changing it changes the product URL.">
              <input
                value={values.slug}
                onChange={(e) => set("slug", e.target.value)}
                className={inputClass}
                placeholder="ultimate-canva-template-pack"
              />
            </Field>
            <Field label="Category" required>
              <select
                required
                value={values.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputClass}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Short Description" hint="Shown under the title on the product page.">
            <textarea
              rows={3}
              value={values.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Full Description" hint="HTML is supported (paragraphs, headings, lists).">
            <textarea
              rows={12}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputClass + " font-mono"}
            />
          </Field>
          <Field label="Features" hint="One feature per line.">
            <textarea
              rows={5}
              value={values.features}
              onChange={(e) => set("features", e.target.value)}
              className={inputClass}
            />
          </Field>
        </Card>

        <Card title="Images">
          <ImageListInput images={values.images} onChange={(images) => set("images", images)} />
          <p className="text-[10px] text-gray-500">
            The first image is the main image shown on cards. Uploads are stored on Cloudinary.
          </p>
        </Card>

        <Card title="Delivery (sent to the customer)">
          <Field label="Delivery Format">
            <select
              value={values.deliveryType}
              onChange={(e) => set("deliveryType", e.target.value as ProductFormValues["deliveryType"])}
              className={inputClass}
            >
              <option value="link">Drive / Canva link</option>
              <option value="pdf">PDF file</option>
              <option value="both">Link + PDF</option>
            </select>
          </Field>
          <Field
            label="Access Link"
            hint="Google Drive / Canva / Notion link. Customers only see this after you send their order."
          >
            <input
              type="url"
              value={values.accessUrl}
              onChange={(e) => set("accessUrl", e.target.value)}
              className={inputClass}
              placeholder="https://drive.google.com/..."
            />
          </Field>
          <Field label="PDF File Name" hint="Optional. Must exist in the server's public/downloads folder.">
            <input
              value={values.pdfFileName}
              onChange={(e) => set("pdfFileName", e.target.value)}
              className={inputClass}
              placeholder="My_Guide.pdf"
            />
          </Field>
        </Card>

        <Card title="SEO">
          <Field label="Meta Title" hint="Leave empty to use the product title.">
            <input value={values.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Meta Description">
            <textarea
              rows={3}
              value={values.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Focus Keyword">
              <input
                value={values.focusKeyword}
                onChange={(e) => set("focusKeyword", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Tags" hint="Comma separated.">
              <input value={values.tags} onChange={(e) => set("tags", e.target.value)} className={inputClass} />
            </Field>
          </div>
        </Card>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6">
        <Card title="Publish">
          <Field label="Status">
            <select
              value={values.status}
              onChange={(e) => set("status", e.target.value as ProductFormValues["status"])}
              className={inputClass}
            >
              <option value="active">Active (visible in store)</option>
              <option value="draft">Draft (hidden from store)</option>
            </select>
          </Field>
          {error && <ErrorState message={error} />}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={primaryButton + " flex-1 justify-center"}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {productId ? "Save Changes" : "Create Product"}
            </button>
            <button type="button" onClick={() => router.back()} className={secondaryButton}>
              Cancel
            </button>
          </div>
        </Card>

        <Card title="Pricing">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sale Price (₹)" required>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(e) => set("price", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Original Price (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.originalPrice}
                onChange={(e) => set("originalPrice", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          {discount > 0 && <p className="text-[11px] text-emerald-400 font-semibold">{discount}% off</p>}
          <Field label="Badge" hint='e.g. "NEW", "BESTSELLER", "FLASH SALE"'>
            <input value={values.badge} onChange={(e) => set("badge", e.target.value)} className={inputClass} />
          </Field>
        </Card>

        <Card title="Store Sections">
          <div className="grid grid-cols-2 gap-2">
            {FLAGS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={values[key] as boolean}
                  onChange={(e) => set(key, e.target.checked as never)}
                  className="accent-[#ff5500]"
                />
                {label}
              </label>
            ))}
          </div>
        </Card>

        <Card title="Ratings">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating (0-5)">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={values.rating}
                onChange={(e) => set("rating", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Review Count">
              <input
                type="number"
                min="0"
                value={values.reviewCount}
                onChange={(e) => set("reviewCount", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </Card>
      </aside>
    </form>
  );
}
