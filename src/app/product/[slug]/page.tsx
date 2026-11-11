import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailsClient from "@/app/product/[slug]/ProductDetailsClient";
import JsonLd from "@/components/JsonLd";
import { cdnImage } from "@/lib/image";
import { plainText, seoDescription, seoTitle } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";

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
    return { title: "Product Not Found | SwagCentral", robots: { index: false } };
  }

  // Titles <= 60 and descriptions <= 155 characters so search results don't cut them off
  const title = seoTitle(product.metaTitle || product.title);
  const description = seoDescription(
    product.metaDescription ||
      product.shortDescription ||
      `${plainText(product.title)}. Digital product delivered by email on SwagCentral.`
  );
  const image = product.thumbnail ? cdnImage(product.thumbnail, 1200) : undefined;
  const path = `/product/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images: image ? [{ url: image, alt: plainText(product.title) }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
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

  // Structured data so Google can show price and rating in search results
  const productUrl = absoluteUrl(`/product/${product.slug}`);
  const productSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: plainText(product.title),
      description: seoDescription(product.shortDescription || product.metaDescription || product.description || product.title),
      image: [product.thumbnail, ...(product.images || [])].filter(Boolean).slice(0, 5).map((u: string) => cdnImage(u, 1200)),
      sku: product.slug,
      brand: { "@type": "Brand", name: SITE.name },
      category: product.categoryName || product.category,
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "INR",
        price: product.price,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: SITE.name },
      },
      ...(product.reviewCount > 0 && product.rating > 0
        ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Shop", item: absoluteUrl("/shop") },
        {
          "@type": "ListItem",
          position: 3,
          name: product.categoryName || product.category,
          item: absoluteUrl(`/shop?category=${encodeURIComponent(product.category)}`),
        },
        { "@type": "ListItem", position: 4, name: plainText(product.title), item: productUrl },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
      <JsonLd data={productSchema} />
      <Header />
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
      />
      <Footer />
    </div>
  );
}
