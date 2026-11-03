"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ErrorState, LoadingState, PageHeader } from "@/components/admin/AdminUI";
import CategoryForm, { CategoryFormValues } from "@/components/admin/CategoryForm";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<CategoryFormValues | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/categories/${id}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load category");
        const c = data.category;
        setInitial({
          name: c.name || "",
          slug: c.slug || "",
          image: c.image || "",
          description: c.description || "",
          orderIndex: String(c.orderIndex ?? 0),
        });
        setProductCount(data.products.length);
      })
      .catch((err) => setError((err as Error).message));
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/admin/categories/${id}`}
        backLabel="Back to category"
        title={initial ? `Edit: ${initial.name}` : "Edit Category"}
      />
      {error ? (
        <ErrorState message={error} />
      ) : initial ? (
        <CategoryForm initial={initial} categoryId={id} productCount={productCount} />
      ) : (
        <LoadingState />
      )}
    </div>
  );
}
