import mongoose, { Document, Model } from "mongoose";
import { TaxRateType } from "../product/product.types";

export interface ICartVariant {
    productId: mongoose.Types.ObjectId;
    variantId: mongoose.Types.ObjectId;
    title?: string;
    price: number;
    quantity: number;
    discountPercent?: number;
    discountedPrice?: number;
    taxRate?: TaxRateType;
    totalPrice?: number;
}

export interface ICart {
    userId: mongoose.Types.ObjectId;
    items: ICartVariant[];
    subTotal: number;
    totalTax: number;
    totalAmount: number;
    handlingCharge: number;
    deliveryCharge: number;
    appliedPromo?: {
        code: string;
        discountAmount: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface ICartDocument extends ICart, Document {}

export interface CartModelType extends Model<ICartDocument> {
    calculateCartTotals(cart: ICartDocument): void;
}