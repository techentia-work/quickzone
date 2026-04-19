import mongoose from "mongoose";
import {
  ShopByStoreModelType,
  IShopByStoreDocument,
} from "../../lib/types/shopByStore/shopByStore.types";

const ShopByStoreSchema = new mongoose.Schema<IShopByStoreDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
ShopByStoreSchema.index({ slug: 1 });
ShopByStoreSchema.index({ name: 1 });
ShopByStoreSchema.index({ masterCategory: 1 });

/* ================= STATICS ================= */
ShopByStoreSchema.statics.isSlugTaken = async function (
  slug: string,
  excludeId?: mongoose.Types.ObjectId
) {
  const query: any = { slug };
  if (excludeId) query._id = { $ne: excludeId };
  return this.exists(query);
};

/**
 * ✅ NO THIRD ARGUMENT
 * Collection auto-created: `shopbystores`
 */
export const ShopByStore = mongoose.model<
  IShopByStoreDocument,
  ShopByStoreModelType
>("ShopByStore", ShopByStoreSchema);
