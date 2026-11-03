"use client";

import React from "react";
import { PageHeader } from "@/components/admin/AdminUI";
import ProductForm, { emptyProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/products"
        backLabel="All products"
        title="Add New Product"
        subtitle="Fill in the details and click Create Product. It goes live in the store right away unless you save it as Draft."
      />
      <ProductForm initial={emptyProductForm} />
    </div>
  );
}
