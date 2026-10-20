export function formatProductDescription(raw: string): string {
  if (!raw) return "";

  let cleaned = raw;

  // 1. Unescape literal string representations: "\\r\\n", "\\n", "\\r"
  cleaned = cleaned.replace(/\\r\\n/g, "\n");
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/\\r/g, "\n");

  // 2. Remove Gutenberg / WordPress / WooCommerce tracking attributes
  cleaned = cleaned.replace(/\s*data-start="[^"]*"/gi, "");
  cleaned = cleaned.replace(/\s*data-end="[^"]*"/gi, "");
  cleaned = cleaned.replace(/\s*data-section-id="[^"]*"/gi, "");
  cleaned = cleaned.replace(/\s*class="[^"]*isSelectedEnd[^"]*"/gi, "");
  cleaned = cleaned.replace(/\s*class="[^"]*PDq2pG_[^"]*"/gi, "");
  cleaned = cleaned.replace(/\s*data-spread="[^"]*"/gi, "");
  cleaned = cleaned.replace(/<div contenteditable="false">\s*<hr\s*\/?>\s*<\/div>/gi, '<hr class="my-6 border-gray-200" />');

  // 3. Remove newlines/spaces between HTML tags (e.g. </p>\n<p> or </h3>\n\n<p>)
  cleaned = cleaned.replace(/>\s*\n+\s*</g, "><");

  // 4. Check if the content is plain text without HTML block tags
  const hasBlockTags = /<(p|div|h[1-6]|ul|ol|li|blockquote|table|section|article)[^>]*>/i.test(cleaned);

  if (!hasBlockTags) {
    const paragraphs = cleaned
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    cleaned = paragraphs
      .map(p => `<p>${p.replace(/\n/g, "<br />")}</p>`)
      .join("");
  } else {
    // If it has block tags, clean any remaining literal \n inside text nodes
    cleaned = cleaned.replace(/\n+/g, " ");
  }

  // 5. Clean empty tags
  cleaned = cleaned.replace(/<p\s*>\s*(<br\s*\/?>)?\s*<\/p>/gi, "");
  cleaned = cleaned.replace(/<p\s*class=""\s*>/gi, "<p>");

  // 6. Detect paragraphs that are lists of emoji bullets (e.g. 🤖 2,000+ Skills<br />⚙️ 107 AI Agents)
  // and convert them into beautiful highlight cards
  cleaned = cleaned.replace(/<p>((\s*(?:[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|•|-|✓|✅)\s*[^<]+(?:<br\s*\/?>)?\s*){2,})<\/p>/gu, (match, inner) => {
    const items = inner.split(/<br\s*\/?>/gi).map((item: string) => item.trim()).filter((item: string) => item.length > 0);
    if (items.length >= 2) {
      const gridItems = items.map((item: string) => `
        <div class="product-feature-pill">
          ${item}
        </div>
      `).join("");
      return `<div class="product-feature-grid">${gridItems}</div>`;
    }
    return match;
  });

  return cleaned.trim();
}

export function formatShortDescription(raw: string): string {
  if (!raw) return "";
  let cleaned = raw;
  cleaned = cleaned.replace(/\\r\\n/g, " ");
  cleaned = cleaned.replace(/\\n/g, " ");
  cleaned = cleaned.replace(/\\r/g, " ");
  cleaned = cleaned.replace(/\n+/g, " ");
  return cleaned.trim();
}
