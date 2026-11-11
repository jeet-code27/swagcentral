/** Store-wide details used by pages, SEO metadata, structured data and llms.txt. */
export const SITE = {
  name: "SwagCentral",
  url: (process.env.NEXT_PUBLIC_APP_URL || "https://swagcentral.in").replace(/\/$/, ""),
  tagline: "Digital products, PLR bundles, AI prompts & templates",
  description:
    "Buy digital products in India: AI prompt packs, Canva templates, reels bundles, eBooks, study material and PLR bundles. Secure payment, delivered by email.",
  email: "swagcentral012@gmail.com",
  whatsapp: "+91 9821774565",
  whatsappLink: "https://wa.me/919821774565",
  location: "Gurgaon, Haryana, India",
  deliveryPromise: "within 12 hours",
  policiesUpdated: "11 November 2026",
  /** Add your page links here; empty ones are hidden on the site */
  social: {
    instagram: "",
    facebook: "",
  },
};

export const absoluteUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
