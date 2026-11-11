import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const order = await Order.findOne({ downloadToken: token }).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderStatus = order.orderStatus || "pending";
    const delivered = orderStatus === "delivered";

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        // Access links are only revealed once the admin has sent the order
        items: order.items.map((item) => ({
          productId: item.productId,
          title: item.title,
          thumbnail: item.thumbnail,
          price: item.price,
          deliveryType: item.deliveryType,
          accessUrl: delivered ? item.accessUrl : "",
          pdfFileName: delivered ? item.pdfFileName : "",
        })),
        totalAmount: order.totalAmount,
        orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Order status error:", error);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}
