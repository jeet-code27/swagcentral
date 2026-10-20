import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Product, IProduct } from "@/models/Product";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductDetailsClient from "@/app/product/[slug]/ProductDetailsClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug });

  if (!product) {
    return {
      title: "Product Not Found | SwagCentral",
    };
  }

  const title = product.metaTitle || `${product.title} | SwagCentral`;
  const rawDesc =
    product.metaDescription ||
    product.shortDescription ||
    `Get instant digital access to ${product.title} on SwagCentral.`;
  const description = rawDesc.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

  return {
    title,
    description,
    keywords: product.focusKeyword
      ? [product.focusKeyword, ...(product.tags || [])]
      : product.tags,
    openGraph: {
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
      url: `https://swagcentral.in/product/${product.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  };
}

export default async function SingleProductPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const productDoc = await Product.findOne({ slug }).lean();

  if (!productDoc) {
    notFound();
  }

  // Convert MongoDB document to plain JSON
  const product = JSON.parse(JSON.stringify(productDoc));

  // Fetch related products in same category
  const relatedDocs = await Product.find({
    category: product.category,
    slug: { $ne: product.slug },
  })
    .limit(4)
    .lean();

  const relatedProducts = JSON.parse(JSON.stringify(relatedDocs));

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Header />
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
      />
      <Footer />
      <CartDrawer />
    </div>
  );
}
