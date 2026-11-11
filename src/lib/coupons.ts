import { Coupon, ICoupon } from "@/models/Coupon";

/** Smallest amount PayU can charge; a coupon never takes an order below this. */
const MIN_PAYABLE = 1;

export function couponLabel(c: Pick<ICoupon, "type" | "value" | "maxDiscount" | "minOrder">): string {
  const off = c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`;
  const cap = c.type === "percent" && c.maxDiscount > 0 ? ` (up to ₹${c.maxDiscount})` : "";
  const min = c.minOrder > 0 ? ` on orders above ₹${c.minOrder}` : "";
  return `${off}${cap}${min}`;
}

/**
 * Checks a coupon code against an order subtotal (in ₹).
 * Returns the discount to apply, or a customer-friendly error.
 */
export async function applyCoupon(
  rawCode: string,
  subtotal: number
): Promise<{ code: string; discount: number; label: string } | { error: string }> {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return { error: "Enter a coupon code" };

  const coupon = await Coupon.findOne({ code });
  if (!coupon || !coupon.active) return { error: "This coupon code is not valid" };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return { error: "This coupon has expired" };
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { error: "This coupon has reached its usage limit" };
  }
  if (subtotal < coupon.minOrder) {
    return { error: `Add ₹${Math.ceil(coupon.minOrder - subtotal)} more to use this coupon (minimum ₹${coupon.minOrder})` };
  }

  let discount = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.type === "percent" && coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.floor(Math.min(discount, subtotal - MIN_PAYABLE));
  if (discount <= 0) return { error: "This coupon does not apply to this order" };

  return { code: coupon.code, discount, label: couponLabel(coupon) };
}

/** Counts a coupon use once its order is paid. */
export async function recordCouponUse(code?: string) {
  if (code) await Coupon.updateOne({ code }, { $inc: { usedCount: 1 } });
}
