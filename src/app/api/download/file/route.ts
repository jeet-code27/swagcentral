import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("file");
  const token = searchParams.get("token");

  if (!fileName || !token) {
    return NextResponse.json({ error: "File and token are required" }, { status: 400 });
  }

  // Sanitize file path to avoid directory traversal
  const safeFileName = path.basename(fileName);

  // Only serve files that belong to a delivered order
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const order = await Order.findOne({
    downloadToken: token,
    orderStatus: "delivered",
    "items.pdfFileName": safeFileName,
  }).lean();
  if (!order) {
    return NextResponse.json({ error: "Not authorized to download this file" }, { status: 403 });
  }

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
