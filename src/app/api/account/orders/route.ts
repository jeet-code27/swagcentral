import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getCustomerEmail } from "@/lib/customerAuth";

export async function GET() {
  const email = await getCustomerEmail();
  if (!email) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Please try again in a minute" }, { status: 503 });

  const orders = await Order.find({ customerEmail: email })
    .select("orderId items.title items.thumbnail items.price totalAmount orderStatus paymentStatus paymentMethod downloadToken createdAt")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({ success: true, email, orders });
}
