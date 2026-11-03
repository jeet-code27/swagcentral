import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadBase64ToCloudinary } from "@/lib/cloudinary";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/**
 * Admin image upload: stores the file on Cloudinary and returns its URL.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const formData = await req.formData();
  const file = formData.get("file");
  const folder = formData.get("folder") === "categories" ? "swagcentral/categories" : "swagcentral/products";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP, GIF or AVIF images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be smaller than 8 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadBase64ToCloudinary(
    `data:${file.type};base64,${buffer.toString("base64")}`,
    folder
  );
  if (!result) {
    return NextResponse.json({ error: "Upload to Cloudinary failed" }, { status: 502 });
  }

  return NextResponse.json({ success: true, url: result.url });
}
