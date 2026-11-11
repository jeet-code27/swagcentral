import mongoose, { Schema, Document, Model } from "mongoose";

export type DeliveryType = "link" | "pdf" | "both";

export interface IProduct extends Document {
  title: string;
  slug: string;
  wcId?: string;
  category: string; // Category slug
  categoryName?: string;
  description: string;
  shortDescription?: string;
  price: number; // in INR
  originalPrice: number; // in INR
  discountPercentage?: number;
  badge?: string; // "NEW", "FLASH SALE", "BESTSELLER", "-33%"
  rating: number;
  reviewCount: number;
  images: string[];
  thumbnail: string;
  deliveryType: DeliveryType;
  accessUrl?: string; // Drive, Canva, Notion link
  pdfFileName?: string; // Stored in server /public/downloads/
  features: string[];
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  isTrending?: boolean;
  salesCount: number;
  /** Display position set in the admin panel (lower shows first; 0 = not ordered yet) */
  sortOrder: number;
  status: "active" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    wcId: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    categoryName: { type: String, default: "" },
    description: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    badge: { type: String, default: "" },
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    thumbnail: { type: String, required: true },
    deliveryType: {
      type: String,
      enum: ["link", "pdf", "both"],
      default: "link",
    },
    accessUrl: { type: String, default: "" },
    pdfFileName: { type: String, default: "" },
    features: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    focusKeyword: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    salesCount: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["active", "draft"], default: "active" },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
