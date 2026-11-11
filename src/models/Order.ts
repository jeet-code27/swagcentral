import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  title: string;
  thumbnail: string;
  price: number;
  deliveryType: "link" | "pdf" | "both";
  accessUrl?: string;
  pdfFileName?: string;
}

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: IOrderItem[];
  totalAmount: number;
  currency: string;
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod: string;
  paymentId?: string;
  /** Latest PayU transaction ID sent for this order (a new one per payment attempt). */
  paymentTxnId?: string;
  paymentAttempts: number;
  paymentMode?: string;
  paymentError?: string;
  paidAt?: Date;
  orderStatus: "pending" | "delivered" | "cancelled";
  confirmationEmailSent: boolean;
  deliveredAt?: Date;
  emailSent: boolean;
  emailSentAt?: Date;
  downloadToken: string;
  accessExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    price: { type: Number, required: true },
    deliveryType: { type: String, required: true },
    accessUrl: { type: String, default: "" },
    pdfFileName: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String, default: "" },
    items: { type: [OrderItemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "Online" },
    paymentId: { type: String, default: "" },
    paymentTxnId: { type: String, default: "", index: true },
    paymentAttempts: { type: Number, default: 0 },
    paymentMode: { type: String, default: "" },
    paymentError: { type: String, default: "" },
    paidAt: { type: Date },
    orderStatus: {
      type: String,
      enum: ["pending", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    confirmationEmailSent: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    downloadToken: { type: String, required: true, unique: true },
    accessExpiry: { type: Date },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
