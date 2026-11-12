import type { Metadata } from "next";
import InfoPage from "@/components/info/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | SwagCentral",
  description: "How SwagCentral collects, uses and protects your personal information when you buy digital products.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" updated={SITE.policiesUpdated}>
      <p>
        This policy explains what information {SITE.name} (&quot;we&quot;, &quot;us&quot;) collects when you use our
        website and buy our digital products, and how we use and protect it.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Order details:</strong> your name, email address, mobile number and the products you buy.
        </li>
        <li>
          <strong>Payment details:</strong> payments are handled by PayU. We do not see or store your card, UPI PIN
          or bank login details. We only receive the payment status, amount and a transaction reference.
        </li>
        <li>
          <strong>Login codes:</strong> when you use My Orders we store a one-time code for 10 minutes and a sign-in
          cookie on your device.
        </li>
        <li>
          <strong>Your cart:</strong> kept in your own browser&apos;s storage, not on our servers.
        </li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To process your payment and deliver your products by email.</li>
        <li>To show your orders in My Orders and help you with support requests.</li>
        <li>To prevent fraud and keep records required by law (for example tax and payment records).</li>
      </ul>
      <p>We do not sell or rent your personal information.</p>
      <h2>Who we share it with</h2>
      <ul>
        <li>PayU, to process payments.</li>
        <li>Our email provider, to send order and login emails.</li>
        <li>Google and Meta, for analytics and advertising measurement (see Cookies and tracking below).</li>
        <li>Our hosting, database and file storage providers, which store data on our behalf.</li>
        <li>Government authorities, when required by law.</li>
      </ul>
      <h2>How long we keep it</h2>
      <p>
        We keep order records for as long as needed to provide your downloads and to meet legal and accounting
        requirements. Login codes are deleted automatically after they expire.
      </p>
      <h2>Your choices</h2>
      <p>
        You can ask us to correct or delete your personal information, subject to records we must keep by law.
        Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <h2>Cookies and tracking</h2>
      <ul>
        <li>
          <strong>Essential cookies</strong> keep you signed in to My Orders and remember your cart.
        </li>
        <li>
          <strong>Analytics and advertising:</strong> we use Google Tag Manager and the Meta (Facebook) Pixel to
          understand how the store is used and to measure and improve our ads. They record actions such as pages
          viewed, products added to the cart and purchases, and may set cookies on your device.
        </li>
      </ul>
      <p>
        You can block or delete cookies in your browser settings, and manage ad preferences in your Facebook and
        Google account settings. Blocking them does not stop you from buying from us.
      </p>
      <h2>Contact</h2>
      <p>
        {SITE.name}, {SITE.location}. Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </InfoPage>
  );
}
