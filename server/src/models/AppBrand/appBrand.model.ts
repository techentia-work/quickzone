import mongoose from "mongoose";
import { AppBrandModelType, IAppBrandDocument } from "../../lib/types/AppBrand/appBrand.types";

const AppBrandSchema = new mongoose.Schema<IAppBrandDocument>(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      unique: true, // A brand can only be added once
    },
    masterCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const AppBrand = mongoose.model<IAppBrandDocument, AppBrandModelType>(
  "AppBrand",
  AppBrandSchema
);
