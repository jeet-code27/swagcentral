import mongoose, { Schema, Document, Model } from "mongoose";

/** One-time email login code for customers (auto-deleted by MongoDB after it expires). */
export interface ILoginCode extends Document {
  email: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const LoginCodeSchema = new Schema<ILoginCode>(
  {
    email: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const LoginCode: Model<ILoginCode> =
  mongoose.models.LoginCode || mongoose.model<ILoginCode>("LoginCode", LoginCodeSchema);
