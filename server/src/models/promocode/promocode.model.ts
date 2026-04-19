import mongoose from "mongoose";
import { IPromoCodeDocument, PromocodeDicountType, PromoCodeModelType } from "../../lib/types/index";
import { promocodeUtils } from "./promocode.utils";

const PromoCodeSchema = new mongoose.Schema<IPromoCodeDocument, PromoCodeModelType>(
    {
        code: { type: String, required: true, unique: true, trim: true, uppercase: true },
        description: { type: String },
        discountType: { type: String, enum: Object.values(PromocodeDicountType), required: true },
        discountValue: { type: Number, required: true, min: 0 },
        maxDiscountAmount: { type: Number, min: 0 },
        minCartValue: { type: Number, min: 0 },
        startDate: { type: Date },
        endDate: { type: Date },
        usageLimit: { type: Number, min: 0 },
        usedCount: { type: Number, default: 0, min: 0 },
        perUserLimit: { type: Number, min: 0 },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// Indexes
PromoCodeSchema.index({ isActive: 1 });

PromoCodeSchema.statics = promocodeUtils.statics;
PromoCodeSchema.methods = promocodeUtils.methods;

export const PromoCode = mongoose.model<IPromoCodeDocument, PromoCodeModelType>("PromoCode", PromoCodeSchema);
