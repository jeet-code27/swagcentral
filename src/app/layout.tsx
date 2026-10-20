import type { Metadata } from "next";
import { Unbounded, Albert_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

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
  title: "SwagCentral | Best Digital Products, PLR Bundles & Templates",
  description:
    "Up to 40% - 75% off for all digital products, AI prompts, Canva templates, eBooks, reels bundles, and marketing tools. Instant digital download.",
  keywords: [
    "digital products",
    "canva templates",
    "ai prompts",
    "reels packs",
    "ebooks",
    "plr bundles",
    "swagcentral",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${unbounded.variable} ${albertSans.variable}`}>
      <body className="min-h-screen flex flex-col font-body bg-[#fdfbf7] text-[#111827] antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
