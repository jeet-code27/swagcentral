import type { Metadata } from "next";
import { Unbounded, Albert_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "600", "700", "800", "900"],
});

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "SwagCentral | Digital Products, PLR Bundles & Templates",
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
    images: [{ url: "/images/hero-banner2.webp", width: 1600, height: 732, alt: SITE.name }],
  },
  twitter: { card: "summary_large_image" },
};

const siteSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/images/logo.webp`,
    email: SITE.email,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.whatsapp.replace(/\s/g, ""),
      contactType: "customer support",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    address: { "@type": "PostalAddress", addressLocality: "Gurgaon", addressRegion: "Haryana", addressCountry: "IN" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${unbounded.variable} ${albertSans.variable}`}>
      <body className="min-h-screen flex flex-col font-body bg-[#fdfbf7] text-[#111827] antialiased">
        <JsonLd data={siteSchema} />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
