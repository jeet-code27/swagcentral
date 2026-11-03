"use client";

import React, { useState } from "react";
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

export interface CategoryFormValues {
  name: string;
  slug: string;
  image: string;
  description: string;
  orderIndex: string;
}

export const emptyCategoryForm: CategoryFormValues = {
  name: "",
  slug: "",
  image: "",
  description: "",
  orderIndex: "0",
};

export default function CategoryForm({
  initial,
  categoryId,
  productCount = 0,
}: {
  initial: CategoryFormValues;
  /** When set, the form updates this category; otherwise it creates a new one. */
  categoryId?: string;
  productCount?: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const slugChanged = !!categoryId && values.slug.trim() !== initial.slug;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(categoryId ? `/api/admin/categories/${categoryId}` : "/api/admin/categories", {
        method: categoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");
      router.push(`/admin/categories/${data.category._id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card title="Category Details">
          <Field label="Name" required>
            <input
              required
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
              placeholder="e.g. Canva Templates"
            />
          </Field>
          <Field label="URL Slug" hint="Leave empty to create it from the name. Used in /shop?category=slug.">
            <input value={values.slug} onChange={(e) => set("slug", e.target.value)} className={inputClass} />
          </Field>
          {slugChanged && productCount > 0 && (
            <p className="text-[11px] text-amber-300">
              Changing the slug will move all {productCount} products to the new slug automatically. Old category
              links will stop working.
            </p>
          )}
          <Field label="Description">
            <textarea
              rows={4}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Display Order" hint="Lower numbers appear first on the homepage.">
            <input
              type="number"
              value={values.orderIndex}
              onChange={(e) => set("orderIndex", e.target.value)}
              className={inputClass + " max-w-[160px]"}
            />
          </Field>
        </Card>

        <Card title="Image">
          <ImageListInput
            single
            folder="categories"
            images={values.image ? [values.image] : []}
            onChange={(imgs) => set("image", imgs[0] || "")}
          />
        </Card>
      </div>

      <aside className="lg:sticky lg:top-6">
        <Card title="Save">
          {error && <ErrorState message={error} />}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={primaryButton + " flex-1 justify-center"}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {categoryId ? "Save Changes" : "Create Category"}
            </button>
            <button type="button" onClick={() => router.back()} className={secondaryButton}>
              Cancel
            </button>
          </div>
        </Card>
      </aside>
    </form>
  );
}
