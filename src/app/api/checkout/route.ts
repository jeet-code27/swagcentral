import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { sendOrderConfirmationEmail } from "@/lib/mailer";
import { getPayuConfig } from "@/lib/payu";
import { startOrderPayment } from "@/lib/orderPayment";
import crypto from "crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customerName = String(body.customerName || "").trim().slice(0, 100);
    const customerEmail = String(body.customerEmail || "").trim().toLowerCase().slice(0, 200);
    const customerPhone = String(body.customerPhone || "").replace(/[^\d+]/g, "").slice(0, 15);
    const items: Array<{ id?: string; slug?: string }> = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !EMAIL_RE.test(customerEmail) || items.length === 0) {
      return NextResponse.json(
        { error: "Valid name, email and at least one item are required" },
        { status: 400 }
      );
    }
    if (customerPhone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { error: "Store is temporarily unavailable. Please try again in a minute." },
        { status: 503 }
      );
    }

    // Resolve cart items against the database so prices and links can't be tampered with
    const ids = items.map((i) => i.id).filter((id): id is string => !!id && mongoose.isValidObjectId(id));
    const slugs = items.map((i) => i.slug || i.id).filter((s): s is string => !!s);
    const products = await Product.find({
      status: "active",
      $or: [{ _id: { $in: ids } }, { slug: { $in: slugs } }],
    }).lean();

    const orderItems = products.map((p) => ({
      productId: String(p._id),
      title: p.title,
      thumbnail: p.thumbnail,
      price: p.price,
      deliveryType: p.deliveryType || "link",
      accessUrl: p.accessUrl || "",
      pdfFileName: p.pdfFileName || "",
    }));

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "The products in your cart are no longer available." },
        { status: 400 }
      );
    }

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price, 0);
    const orderId = `SWAG-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const downloadToken = crypto.randomBytes(16).toString("hex");

    const payuEnabled = !!getPayuConfig();

    // Order stays pending until it is paid, then until the admin sends it from the admin panel
    const order = await Order.create({
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      items: orderItems,
      totalAmount,
      currency: "INR",
      paymentStatus: "pending",
      paymentMethod: payuEnabled ? "PayU" : "Manual",
      orderStatus: "pending",
      downloadToken,
      emailSent: false,
    });

    // Online payment: send the customer to PayU. The confirmation email goes out once PayU confirms payment.
    if (payuEnabled) {
      const payment = await startOrderPayment(order);
      return NextResponse.json({ success: true, orderId, downloadToken, payment });
    }

    // No payment gateway configured: manual flow (confirmation email right away)
    const mailResult = await sendOrderConfirmationEmail({
      orderId,
      customerName,
      customerEmail,
      items: orderItems,
      totalAmount,
      downloadToken,
    });
    if (mailResult.success) {
      order.confirmationEmailSent = true;
      await order.save();
    }

    return NextResponse.json({
      success: true,
      orderId,
      downloadToken,
      message: "Order received. Confirmation email sent.",
    });
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 });
  }
}
