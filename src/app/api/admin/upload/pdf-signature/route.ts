import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { cloudinary, initCloudinary } from "@/lib/cloudinary";

const PDF_FOLDER = "swagcentral/pdfs";

/**
 * Returns a signature so the admin's browser can upload a PDF straight to Cloudinary
 * (avoids server body-size limits). Files are stored as private "authenticated" raw assets.
 */
export async function POST() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  initCloudinary();
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  if (!cloud_name || !api_key || !api_secret) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
  }

  const params = {
    folder: PDF_FOLDER,
    timestamp: Math.round(Date.now() / 1000),
    type: "authenticated",
    unique_filename: true,
    use_filename: true,
  };
  const signature = cloudinary.utils.api_sign_request(params, api_secret);

  return NextResponse.json({
    success: true,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloud_name}/raw/upload`,
    fields: { ...params, api_key, signature },
  });
}
