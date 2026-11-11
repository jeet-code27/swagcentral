import type { Metadata } from "next";

// Order pages are private to each customer
export const metadata: Metadata = {
  title: "Your Order | SwagCentral",
  robots: { index: false, follow: false },
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
