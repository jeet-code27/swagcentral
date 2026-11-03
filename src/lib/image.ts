/**
 * Returns a resized, auto-format (WebP/AVIF) version of a Cloudinary image URL.
 * Non-Cloudinary URLs are returned unchanged.
 */
export function cdnImage(url: string | undefined, width: number): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) return url;
  // Skip URLs that already carry a transformation
  if (/\/image\/upload\/[a-z]_[^/]*,/.test(url)) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
