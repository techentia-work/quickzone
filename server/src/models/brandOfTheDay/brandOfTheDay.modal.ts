import mongoose from "mongoose";
import {
  BrandOfTheDayModelType,
  IBrandOfTheDayDocument,
} from "../../lib/types/brandOfTheDay/brandOfTheDay.types";

const BrandOfTheDaySchema = new mongoose.Schema<IBrandOfTheDayDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },

    banner: {
      type: String,
      default: null,
    },

    thumbnail: {
      type: String,
      default: null,
    },

    masterCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
BrandOfTheDaySchema.index({ name: 1 });
BrandOfTheDaySchema.index({ title: 1 });
BrandOfTheDaySchema.index({ masterCategory: 1 });

/**
 * ✅ name + title + websiteUrl
 * ❌ NO slug
 * Collection: brandofthedays
 */
export const BrandOfTheDay = mongoose.model<
  IBrandOfTheDayDocument,
  BrandOfTheDayModelType
>("BrandOfTheDay", BrandOfTheDaySchema);
