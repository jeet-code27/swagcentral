"use client";

import React from "react";
import { PageHeader } from "@/components/admin/AdminUI";
import CategoryForm, { emptyCategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader backHref="/admin/categories" backLabel="All categories" title="Add New Category" />
      <CategoryForm initial={emptyCategoryForm} />
    </div>
  );
}
