/** Store-wide details used by pages, SEO metadata, structured data and llms.txt. */
export const SITE = {
  name: "SwagCentral",
  /**
   * Public address used for canonical URLs, sitemap, robots, structured data and llms.txt.
   * Fixed to the live domain so it never picks up a local/dev address.
   * (NEXT_PUBLIC_APP_URL is separate: it is where PayU and emails send people back to.)
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://swagcentral.in").replace(/\/$/, ""),
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
    instagram: "https://www.instagram.com/swag.central__",
    facebook: "https://www.facebook.com/people/Swag-Central/61562337235447/",
  },
};

export const absoluteUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
