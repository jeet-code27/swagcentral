import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailsClient from "@/app/product/[slug]/ProductDetailsClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

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
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category, product.slug);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <Header />
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
      />
      <Footer />
    </div>
  );
}
