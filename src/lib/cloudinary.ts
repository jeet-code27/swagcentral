import { v2 as cloudinary } from "cloudinary";

export function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export { cloudinary };

/**
 * Upload a remote image URL directly to Cloudinary
 */
export async function uploadRemoteImageToCloudinary(
  imageUrl: string,
  folder = "swagcentral/products"
): Promise<{ url: string; publicId: string } | null> {
  try {
    initCloudinary();

    const res = await cloudinary.uploader.upload(imageUrl, {
      folder,
      resource_type: "image",
    });

    return {
      url: res.secure_url,
      publicId: res.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed for:", imageUrl, (error as Error).message);
    return null;
  }
}

/**
 * Upload a base64 or file buffer to Cloudinary
 */
export async function uploadBase64ToCloudinary(
  base64Data: string,
  folder = "swagcentral/products"
): Promise<{ url: string; publicId: string } | null> {
  try {
    initCloudinary();

    const res = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: "image",
    });

    return {
      url: res.secure_url,
      publicId: res.public_id,
    };
  } catch (error) {
    console.error("Cloudinary base64 upload failed:", error);
    return null;
  }
}

/**
 * Short-lived signed download link for a private (authenticated) raw file, e.g. a product PDF.
 */
export function getPrivateRawDownloadUrl(publicId: string, expiresInSeconds = 600): string {
  initCloudinary();
  return cloudinary.utils.private_download_url(publicId, "", {
    resource_type: "raw",
    type: "authenticated",
    attachment: true,
    expires_at: Math.round(Date.now() / 1000) + expiresInSeconds,
  });
}
