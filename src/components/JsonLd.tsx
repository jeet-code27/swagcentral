/** Renders schema.org structured data (JSON-LD) for search engines. */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // "<" is escaped so product text can never close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
