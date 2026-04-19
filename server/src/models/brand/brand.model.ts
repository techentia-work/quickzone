import mongoose from "mongoose";
import { BrandModelType, IBrandDocument } from "../../lib/types/index";

const BrandSchema = new mongoose.Schema<IBrandDocument>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        banner: { type: String, default: null },
        thumbnail: { type: String, default: null },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

BrandSchema.index({ slug: 1 })
BrandSchema.index({ name: 1 })

BrandSchema.statics.isSlugTaken = async function (slug, excludeId) {
    const query: any = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    return await this.exists(query);
};

export const Brand = mongoose.model<IBrandDocument, BrandModelType>("Brand", BrandSchema)
