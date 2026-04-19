import mongoose from "mongoose";
import { IShowcaseProductDocument } from "../../lib/types/index";

const ShowcaseProductSchema = new mongoose.Schema<IShowcaseProductDocument>(
  {
    showcaseType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],

    masterCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Fast queries
ShowcaseProductSchema.index({ isActive: 1, isDeleted: 1 });

export const ShowcaseProduct = mongoose.model<IShowcaseProductDocument>(
  "ShowcaseProduct",
  ShowcaseProductSchema
);
