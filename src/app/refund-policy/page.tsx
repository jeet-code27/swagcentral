import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/info/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | SwagCentral",
  description: "When SwagCentral refunds or cancels orders for digital products, and how long refunds take.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <InfoPage title="Refund & Cancellation Policy" updated={SITE.policiesUpdated}>
      <p>
        Our products are digital and can be copied once delivered, so we cannot take them back. For this reason,
        refunds are limited to the situations below.
      </p>
      <h2>You are eligible for a full refund if</h2>
      <ul>
        <li>You paid but we did not send your products within 48 hours, and you ask for a refund.</li>
        <li>You were charged twice for the same order.</li>
        <li>The files or links we sent do not work and we cannot fix or replace them within 3 days of you telling us.</li>
        <li>You received a different product from the one you paid for and we cannot send the correct one.</li>
      </ul>
      <h2>Refunds are not given if</h2>
      <ul>
        <li>The products have been delivered and work as described.</li>
        <li>You changed your mind or bought the wrong product after delivery.</li>
        <li>The issue is caused by your device or software not supporting a standard file format.</li>
      </ul>
      <h2>Cancellation</h2>
      <p>
        You can cancel an order for a full refund before we have sent your download links. Contact us with your
        order ID as soon as possible. Once the links are sent, the order cannot be cancelled.
      </p>
      <h2>How to ask for a refund</h2>
      <p>
        Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or WhatsApp{" "}
        <a href={SITE.whatsappLink}>{SITE.whatsapp}</a> within 7 days of your order, with your order ID and the
        reason. You can find your order ID in your confirmation email or in <Link href="/account">My Orders</Link>.
      </p>
      <h2>Refund timeline</h2>
      <p>
        Approved refunds are made to your original payment method through PayU. After we approve it, the money
        usually reaches your account within 5–7 working days, depending on your bank.
      </p>
    </InfoPage>
  );
}
