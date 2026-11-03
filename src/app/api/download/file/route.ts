import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getPrivateRawDownloadUrl } from "@/lib/cloudinary";
import { cloudinaryPdfPublicId, isCloudinaryPdf } from "@/lib/pdf";

export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get("file");
  const token = req.nextUrl.searchParams.get("token");

  if (!fileName || !token) {
    return NextResponse.json({ error: "File and token are required" }, { status: 400 });
  }

  // Only serve files that belong to a delivered order
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const order = await Order.findOne({
    downloadToken: token,
    orderStatus: "delivered",
    "items.pdfFileName": fileName,
  }).lean();
  if (!order) {
    return NextResponse.json({ error: "Not authorized to download this file" }, { status: 403 });
  }

  // Private PDF on Cloudinary: send the customer to a short-lived signed link
  if (isCloudinaryPdf(fileName)) {
    return NextResponse.redirect(getPrivateRawDownloadUrl(cloudinaryPdfPublicId(fileName)));
  }

  // Legacy PDF stored in public/downloads (sanitized to avoid directory traversal)
  const safeFileName = path.basename(fileName);
  const filePath = path.join(process.cwd(), "public", "downloads", safeFileName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = await fs.promises.readFile(filePath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFileName}"`,
    },
  });
}
