import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description: string;
  type: "percent" | "flat";
  /** Percent off (1-90) or flat ₹ off */
  value: number;
  /** Max ₹ off for percent coupons (0 = no cap) */
  maxDiscount: number;
  minOrder: number;
  /** 0 = unlimited */
  usageLimit: number;
  usedCount: number;
  active: boolean;
  /** Shown in the homepage coupon banner */
  featured: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["percent", "flat"], default: "percent" },
    value: { type: Number, required: true },
    maxDiscount: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
