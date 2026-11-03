/**
 * Product/order PDFs are stored privately on Cloudinary. The `pdfFileName` field holds
 * `cloudinary:<public_id>` for those; older values are plain file names in public/downloads.
 */
export const CLOUDINARY_PDF_PREFIX = "cloudinary:";

export function isCloudinaryPdf(value?: string | null): boolean {
  return !!value && value.startsWith(CLOUDINARY_PDF_PREFIX);
}

export function cloudinaryPdfPublicId(value: string): string {
  return value.slice(CLOUDINARY_PDF_PREFIX.length);
}

/** Human-friendly file name for showing in the admin panel and to customers. */
export function pdfDisplayName(value?: string | null): string {
  if (!value) return "";
  const name = isCloudinaryPdf(value) ? cloudinaryPdfPublicId(value).split("/").pop() || "" : value;
  // Cloudinary appends a random suffix to keep names unique, e.g. Guide_ab12cd.pdf
  return name.replace(/_[a-z0-9]{6}(\.pdf)$/i, "$1");
}
