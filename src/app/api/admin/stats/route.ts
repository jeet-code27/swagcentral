import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [orderStats, weekRevenue, productCount, productsWithoutLink, categoryCount, recentOrders] =
    await Promise.all([
      Order.aggregate<{ _id: string; count: number; revenue: number }>([
        { $group: { _id: { $ifNull: ["$orderStatus", "pending"] }, count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate<{ revenue: number }>([
        { $match: { orderStatus: "delivered", createdAt: { $gte: weekAgo } } },
        { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
      ]),
      Product.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "active", accessUrl: { $in: ["", null] }, pdfFileName: { $in: ["", null] } }),
      Category.countDocuments({}),
      Order.find({})
        .select("orderId customerName customerEmail items.title totalAmount orderStatus downloadToken createdAt")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

  const byStatus = Object.fromEntries(orderStats.map((s) => [s._id, s]));

  return NextResponse.json({
    success: true,
    stats: {
      revenue: byStatus.delivered?.revenue || 0,
      revenueThisWeek: weekRevenue[0]?.revenue || 0,
      pendingOrders: byStatus.pending?.count || 0,
      pendingValue: byStatus.pending?.revenue || 0,
      deliveredOrders: byStatus.delivered?.count || 0,
      productCount,
      productsWithoutLink,
      categoryCount,
    },
    recentOrders,
  });
}
