/** Helpers that keep titles and descriptions within search-engine display limits. */

const ENTITIES: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };

/** Strips HTML tags/entities and collapses whitespace. */
export function plainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\[rn]/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cuts text at a word boundary so it fits in `max` characters. */
export function clip(value: string, max: number): string {
  const text = plainText(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:|–-]+$/, "")}…`;
}

/** Page title of at most 60 characters, adding the brand only when it fits. */
export function seoTitle(value: string, brand = "SwagCentral"): string {
  const base = plainText(value)
    .replace(/\s*\|\s*₹\s?\d[\d,]*.*$/, "") // drop trailing "| ₹499 ..." price text
    .replace(/\s*\|\s*SwagCentral\s*$/i, "");
  const withBrand = `${base} | ${brand}`;
  return withBrand.length <= 60 ? withBrand : clip(base, 60);
}

/** Meta description of at most 155 characters. */
export function seoDescription(value: string): string {
  return clip(value, 155);
}
