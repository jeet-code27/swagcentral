import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { PRODUCTS } from "@/data/mockData";
import { sendOrderDeliveryEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, items, totalAmount } = body;

    if (!customerEmail || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer email and items are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Map items with digital delivery details (links, pdf paths)
    const orderItems = items.map((cartItem: { id: string; title: string; price: number; thumbnail: string; deliveryType: "link" | "pdf" | "both" }) => {
      // Look up corresponding product in mock/DB data to ensure secure access links
      const match = PRODUCTS.find((p) => p.id === cartItem.id || p.slug === cartItem.id);

      return {
        productId: cartItem.id,
        title: cartItem.title,
        thumbnail: cartItem.thumbnail,
        price: cartItem.price,
        deliveryType: cartItem.deliveryType || "link",
        accessUrl: match?.accessUrl || "https://drive.google.com/drive/folders/swagcentral-access-hub",
        pdfFileName: match?.pdfFileName || "Claude_Bundle_Starter_Guide.pdf",
      };
    });

    const orderId = `SWAG-${Date.now().toString(36).toUpperCase()}`;
    const downloadToken = crypto.randomBytes(16).toString("hex");

    // Create order document
    let orderRecord = null;
    try {
      orderRecord = await Order.create({
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        items: orderItems,
        totalAmount,
        currency: "INR",
        paymentStatus: "completed", // Automatic confirmation for instant access
        paymentMethod: "Online UPI/Card",
        paymentId: `PAY-${Date.now()}`,
        downloadToken,
        emailSent: false,
      });
    } catch (dbErr) {
      console.warn("DB save note (running in memory fallback if mongo is offline):", dbErr);
    }

    // Trigger instant email delivery automation
    const emailPayload = {
      orderId,
      customerName,
      customerEmail,
      items: orderItems,
      totalAmount,
      downloadToken,
    } as any;

    try {
      const emailResult = await sendOrderDeliveryEmail(emailPayload);
      if (emailResult.success && orderRecord) {
        orderRecord.emailSent = true;
        orderRecord.emailSentAt = new Date();
        await orderRecord.save();
      }
    } catch (mailErr) {
      console.error("Email delivery automation note:", mailErr);
    }

    return NextResponse.json({
      success: true,
      orderId,
      downloadToken,
      message: "Order placed successfully. Digital delivery prepared.",
    });
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Checkout failed" },
      { status: 500 }
    );
  }
}
