import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/info/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us | SwagCentral",
  description:
    "SwagCentral is an Indian store for digital products: AI prompts, Canva templates, reels bundles, eBooks and PLR bundles, delivered by email.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage title="About Us" intro="Ready-to-use digital products for creators, students and small businesses in India.">
      <p>
        {SITE.name} is an online store for digital products. We put together useful bundles such as AI prompt
        packs, Canva templates, reels and video packs, eBooks, study material and PLR (private label rights)
        bundles, and sell them at affordable prices.
      </p>
      <h2>How buying works</h2>
      <ul>
        <li>Choose your products and pay securely through PayU (UPI, cards, net banking or wallets).</li>
        <li>You get an order confirmation email right after payment.</li>
        <li>
          Our team sends your download links to your email {SITE.deliveryPromise}. You can also see them any time
          on <Link href="/account">My Orders</Link>.
        </li>
      </ul>
      <h2>Why customers choose us</h2>
      <ul>
        <li>Curated bundles in categories people actually use.</li>
        <li>Fair prices in Indian rupees with secure payments.</li>
        <li>Real support on WhatsApp and email if you get stuck.</li>
      </ul>
      <h2>Contact</h2>
      <p>
        {SITE.name}, {SITE.location}. Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or WhatsApp{" "}
        <a href={SITE.whatsappLink}>{SITE.whatsapp}</a>. See our <Link href="/contact">contact page</Link> for more.
      </p>
    </InfoPage>
  );
}
