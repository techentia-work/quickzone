import mongoose, { Document } from "mongoose";

export interface ISeller extends Document {
  name: string;
  email: string;
  phone: string;
  address?: string;
  gstNumber?: string;
  taxId?: string;
  businessType?: string;
  ratings?: { avg: number; count: number };
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new mongoose.Schema<ISeller>(
  {
    name: { type: String, required: true },
    email: { type: String, index: true, unique: true },
    phone: { type: String, index: true, unique: true },
    address: { type: String },
    gstNumber: { type: String },
    taxId: { type: String },
    businessType: { type: String },
    ratings: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    kycStatus: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }
);

// Indexes
SellerSchema.index({ name: "text", phone: "text" });
SellerSchema.index({ isActive: 1, isVerified: 1 });
SellerSchema.index({ createdAt: -1 });

export const Seller = mongoose.model<ISeller>("Seller", SellerSchema);