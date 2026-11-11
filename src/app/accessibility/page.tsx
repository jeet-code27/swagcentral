import type { Metadata } from "next";
import InfoPage from "@/components/info/InfoPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility | SwagCentral",
  description: "SwagCentral's commitment to making the store usable for everyone, and how to report an accessibility problem.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <InfoPage title="Accessibility" updated={SITE.policiesUpdated}>
      <p>
        We want everyone to be able to browse and buy from {SITE.name}, including people who use assistive
        technology.
      </p>
      <h2>What we do</h2>
      <ul>
        <li>Pages work on phones, tablets and computers, and can be zoomed without breaking.</li>
        <li>Images have text descriptions and buttons have readable labels.</li>
        <li>Checkout and My Orders can be used with a keyboard.</li>
      </ul>
      <h2>Found a problem?</h2>
      <p>
        If something is hard to use, tell us what page and what you were trying to do. Email{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or WhatsApp <a href={SITE.whatsappLink}>{SITE.whatsapp}</a>.
        We can also help you complete an order directly.
      </p>
    </InfoPage>
  );
}
