/** Shared (client + server) helpers for an order's combined payment / delivery state. */

interface OrderLike {
  orderStatus?: "pending" | "delivered" | "cancelled";
  paymentStatus?: "pending" | "completed" | "failed";
  paymentMethod?: string;
}

export type OrderView = "awaiting_payment" | "to_send" | "delivered" | "cancelled";

/**
 * An order is paid only once PayU confirms it or the admin marks it paid.
 * (Old manual orders without a confirmed payment count as unpaid.)
 */
export function isOrderPaid(order: OrderLike): boolean {
  return order.paymentStatus === "completed";
}

export function getOrderView(order: OrderLike): OrderView {
  if (order.orderStatus === "cancelled") return "cancelled";
  if (order.orderStatus === "delivered") return "delivered";
  return isOrderPaid(order) ? "to_send" : "awaiting_payment";
}
