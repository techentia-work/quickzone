// models/featuredWeekBrand.model.ts
import mongoose from "mongoose";
import {
  FeaturedWeekBrandModelType,
  IFeaturedWeekBrandDocument,
} from "../../lib/types/index";

const FeaturedWeekBrandSchema =
  new mongoose.Schema<IFeaturedWeekBrandDocument>(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },

      banner: { type: String, default: null },
      thumbnail: { type: String, default: null },

      masterCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
      },

      isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

FeaturedWeekBrandSchema.index({ slug: 1 });
FeaturedWeekBrandSchema.index({ name: 1 });
FeaturedWeekBrandSchema.index({ masterCategory: 1 });

FeaturedWeekBrandSchema.statics.isSlugTaken = async function (
  slug,
  excludeId
) {
  const query: any = { slug };
  if (excludeId) query._id = { $ne: excludeId };
  return this.exists(query);
};

export const FeaturedWeekBrand = mongoose.model<
  IFeaturedWeekBrandDocument,
  FeaturedWeekBrandModelType
>("FeaturedWeekBrand", FeaturedWeekBrandSchema);
