import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/info/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service | SwagCentral",
  description: "The terms for buying and using digital products from SwagCentral, including licence, payment and delivery.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Service" updated={SITE.policiesUpdated}>
      <p>
        By using this website or buying from {SITE.name}, you agree to these terms. Please read them along with our{" "}
        <Link href="/privacy">Privacy Policy</Link> and <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link>.
      </p>
      <h2>Digital products</h2>
      <p>
        All products are digital files or online access links (for example Google Drive or Canva links). Nothing is
        shipped physically. Product descriptions explain what each bundle includes.
      </p>
      <h2>Prices and payment</h2>
      <ul>
        <li>Prices are in Indian rupees (₹) and are shown on the product page and at checkout.</li>
        <li>Payments are processed by PayU. An order is confirmed only after the payment succeeds.</li>
        <li>Coupon codes, when offered, apply only as described and cannot be exchanged for cash.</li>
      </ul>
      <h2>Delivery</h2>
      <p>
        After a successful payment we email your download links {SITE.deliveryPromise}. Please enter your email
        address correctly at checkout; we are not responsible for delays caused by a wrong email address.
      </p>
      <h2>Licence and permitted use</h2>
      <ul>
        <li>Buying a product gives you a licence to use it; it does not transfer ownership or copyright.</li>
        <li>
          Unless a product clearly states resell, master resell or PLR rights, you may not resell, share, upload or
          give away the files.
        </li>
        <li>Products with resell or PLR rights may be used only within the rights stated for that product.</li>
        <li>Do not share your download links publicly. We may disable access if links are misused.</li>
      </ul>
      <h2>Your responsibilities</h2>
      <p>
        You agree to provide accurate details, use the website lawfully and not attempt to interfere with its
        security or payments.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        Products are provided for informational and creative use. Results from using them (for example business or
        exam results) are not guaranteed. Our total liability for any order is limited to the amount you paid for it.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms. The version on this page applies to orders placed after it is published.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. Courts in Gurgaon, Haryana have jurisdiction.</p>
      <h2>Contact</h2>
      <p>
        Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or WhatsApp{" "}
        <a href={SITE.whatsappLink}>{SITE.whatsapp}</a>.
      </p>
    </InfoPage>
  );
}
