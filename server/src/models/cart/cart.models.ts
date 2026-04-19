import mongoose from "mongoose";
import { CartModelType, ICartDocument, ICartVariant, TaxRateType } from "../../lib/types/index";
import { cartUtils } from "./cart.utils";

const CartVariantSchema = new mongoose.Schema<ICartVariant>(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
        title: { type: String },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        discountPercent: { type: Number, default: 0, min: 0, max: 100 },
        discountedPrice: { type: Number },
        taxRate: { type: String, enum: Object.values(TaxRateType), default: TaxRateType.GST_5 },
        totalPrice: { type: Number },
    },
    { _id: false }
);

const CartSchema = new mongoose.Schema<ICartDocument, CartModelType>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [CartVariantSchema],
        subTotal: { type: Number, default: 0 },
        totalTax: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        handlingCharge: { type: Number, default: 0 },
        deliveryCharge: { type: Number, default: 0 },
        appliedPromo: {
            code: { type: String },
            discountAmount: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

// Index for efficient queries
CartSchema.index({ userId: 1 });

// Pre-save hook to calculate totals
CartSchema.pre("save", cartUtils.calculateCartTotals);

export const Cart = mongoose.model<ICartDocument, CartModelType>("Cart", CartSchema);
