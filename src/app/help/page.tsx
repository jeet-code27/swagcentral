import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/info/InfoPage";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ & Support | SwagCentral",
  description:
    "Answers about payments, delivery time, downloading your files, My Orders login and refunds at SwagCentral.",
  alternates: { canonical: "/help" },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "How will I receive my products?",
    a: `After your payment is confirmed you get an order confirmation email. Our team then emails your download links ${SITE.deliveryPromise}. The same links appear on your order page and in My Orders.`,
  },
  {
    q: "Which payment methods can I use?",
    a: "Payments are processed securely by PayU. You can pay with UPI (Google Pay, PhonePe, Paytm and others), debit or credit cards, net banking and wallets.",
  },
  {
    q: "Money was deducted but my order shows payment pending. What should I do?",
    a: "Bank confirmations can take a few minutes. Your order updates automatically once PayU confirms the payment. If it still shows pending after an hour, WhatsApp us your order ID.",
  },
  {
    q: "How do I see my past orders and downloads?",
    a: "Open My Orders, enter the email you used at checkout and type the 6-digit code we email you. No password is needed.",
  },
  {
    q: "I did not get the email. Where is it?",
    a: "Check your Spam and Promotions folders and search for SwagCentral. You can also open My Orders to see your links, or contact us on WhatsApp.",
  },
  {
    q: "Can I get a refund?",
    a: "Because these are digital products, refunds are given only in the cases listed in our Refund & Cancellation Policy, such as an order we could not deliver or a duplicate payment.",
  },
  {
    q: "Can I resell the products?",
    a: "Only products that clearly say they include resell or PLR rights can be resold, and only under the terms given with that product. Other products are for your personal or business use.",
  },
];

export default function HelpPage() {
  return (
    <InfoPage title="FAQ & Support" intro="Quick answers to the questions we get most often.">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      {FAQS.map((f) => (
        <section key={f.q} className="space-y-1.5 pb-2">
          <h2>{f.q}</h2>
          <p>{f.a}</p>
        </section>
      ))}
      <h2>Still need help?</h2>
      <p>
        Visit <Link href="/account">My Orders</Link>, WhatsApp <a href={SITE.whatsappLink}>{SITE.whatsapp}</a> or
        email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </InfoPage>
  );
}
