import { Order, IOrder } from "@/models/Order";
import { buildPayuPayment, verifyPayuTransaction } from "@/lib/payu";
import { sendOrderConfirmationEmail } from "@/lib/mailer";
import { recordCouponUse } from "@/lib/coupons";

/**
 * Starts a new PayU payment attempt for an unpaid order and returns the form to POST to PayU.
 * PayU needs a unique txnid per attempt, so each retry gets a suffix.
 */
export async function startOrderPayment(order: IOrder) {
  order.paymentAttempts = (order.paymentAttempts || 0) + 1;
  order.paymentTxnId = `${order.orderId}-${order.paymentAttempts}`;
  order.paymentMethod = "PayU";
  await order.save();

  return buildPayuPayment({
    txnid: order.paymentTxnId,
    amount: order.totalAmount,
    productinfo:
      order.items.length === 1 ? order.items[0].title : `${order.items.length} digital products from SwagCentral`,
    firstname: order.customerName,
    email: order.customerEmail,
    phone: order.customerPhone || "",
    orderId: order.orderId,
  });
}

export type PaymentOutcome = "paid" | "failed" | "pending" | "not_found";

/**
 * Confirms a PayU transaction with PayU's server and updates the order.
 * Safe to call many times (browser return + webhook): the confirmation email is sent once.
 */
export async function applyPayuTransaction(
  txnid: string
): Promise<{ outcome: PaymentOutcome; order: IOrder | null }> {
  // txnid is "<orderId>-<attempt>"; any attempt (not just the latest) can complete the order
  const orderId = txnid.replace(/-\d+$/, "");
  const order = await Order.findOne({ $or: [{ paymentTxnId: txnid }, { orderId }] });
  if (!order) return { outcome: "not_found", order: null };

  if (order.paymentStatus === "completed") return { outcome: "paid", order };

  const tx = await verifyPayuTransaction(txnid);
  if (!tx) return { outcome: "pending", order };

  if (tx.status === "success") {
    // Guard against amount tampering
    if (Math.abs(tx.amount - order.totalAmount) > 0.01) {
      order.paymentStatus = "failed";
      order.paymentError = `Amount mismatch: paid ₹${tx.amount}, order total ₹${order.totalAmount}`;
      await order.save();
      console.error(`PayU amount mismatch for ${order.orderId}`, tx);
      return { outcome: "failed", order };
    }

    // Atomic update so only one caller (callback or webhook) marks it paid and sends the email
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: "completed" } },
      {
        paymentStatus: "completed",
        paymentTxnId: txnid,
        paymentId: tx.mihpayid,
        paymentMode: tx.mode,
        paymentError: "",
        paidAt: new Date(),
      },
      { new: true }
    );
    if (!updated) {
      return { outcome: "paid", order: await Order.findById(order._id) };
    }
    await recordCouponUse(updated.couponCode);

    const mail = await sendOrderConfirmationEmail({
      orderId: updated.orderId,
      customerName: updated.customerName,
      customerEmail: updated.customerEmail,
      items: updated.items,
      totalAmount: updated.totalAmount,
      downloadToken: updated.downloadToken,
    });
    if (mail.success) {
      updated.confirmationEmailSent = true;
      await updated.save();
    }
    return { outcome: "paid", order: updated };
  }

  // Only the latest attempt may mark the order failed (an older failed attempt is irrelevant)
  if (tx.status === "failure" && order.paymentTxnId === txnid) {
    order.paymentStatus = "failed";
    order.paymentError = tx.errorMessage || tx.unmappedStatus;
    await order.save();
    return { outcome: "failed", order };
  }
  if (tx.status === "failure") return { outcome: "failed", order };

  return { outcome: "pending", order };
}

const NOT_FOUND_REASON = "Customer left before completing the payment on PayU";

/**
 * Re-checks unpaid orders with PayU. Catches payments whose browser return never reached us
 * (e.g. the customer closed the tab) and records why the others did not go through
 * (cancelled, page timed out, declined...). Paid orders get the usual confirmation email.
 */
export async function syncUnpaidOrders(days = 15, limit = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const orders = await Order.find({
    paymentStatus: "pending",
    orderStatus: { $ne: "cancelled" },
    paymentTxnId: { $nin: ["", null] },
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  let paid = 0;
  let failed = 0;
  await Promise.all(
    orders.map(async (order) => {
      try {
        const { outcome } = await applyPayuTransaction(order.paymentTxnId!);
        if (outcome === "paid") paid++;
        else if (outcome === "failed") failed++;
        else if (outcome === "pending") {
          // PayU has nothing (or nothing final) for this attempt
          const ageMinutes = (Date.now() - order.updatedAt.getTime()) / 60000;
          if (ageMinutes > 20 && !order.paymentError) {
            await Order.updateOne(
              { _id: order._id, paymentStatus: "pending" },
              { paymentError: NOT_FOUND_REASON }
            );
          }
        }
      } catch (error) {
        console.error(`PayU sync failed for ${order.orderId}:`, error);
      }
    })
  );
  return { checked: orders.length, paid, failed };
}
