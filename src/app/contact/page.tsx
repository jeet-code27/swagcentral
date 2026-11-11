import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/info/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us | SwagCentral",
  description: `Contact SwagCentral on WhatsApp ${SITE.whatsapp} or email ${SITE.email} for order, payment or download help.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <InfoPage title="Contact Us" intro="We usually reply within a few hours, 10 AM to 8 PM IST.">
      <h2>WhatsApp (fastest)</h2>
      <p>
        <a href={SITE.whatsappLink}>{SITE.whatsapp}</a> — message us with your order ID or the email you used at
        checkout.
      </p>
      <h2>Email</h2>
      <p>
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
      <h2>Address</h2>
      <p>
        {SITE.name}, {SITE.location}
      </p>
      <h2>Before you write</h2>
      <ul>
        <li>
          To see your orders and download links, sign in at <Link href="/account">My Orders</Link> with your email.
        </li>
        <li>
          Common questions are answered on our <Link href="/help">FAQ & Support</Link> page.
        </li>
        <li>
          For refunds, please read our <Link href="/refund-policy">Refund & Cancellation Policy</Link>.
        </li>
      </ul>
    </InfoPage>
  );
}
