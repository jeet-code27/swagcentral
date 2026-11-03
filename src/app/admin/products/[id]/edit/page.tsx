"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ErrorState, LoadingState, PageHeader } from "@/components/admin/AdminUI";
import ProductForm, { ProductFormValues, productToForm } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<ProductFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load product");
        setInitial(productToForm(data.product));
      })
      .catch((err) => setError((err as Error).message));
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/admin/products/${id}`}
        backLabel="Back to product"
        title={initial ? `Edit: ${initial.title}` : "Edit Product"}
      />
      {error ? <ErrorState message={error} /> : initial ? <ProductForm initial={initial} productId={id} /> : <LoadingState />}
    </div>
  );
}
