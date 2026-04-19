// src/lib/types/promocode.types.ts

import { Document, Model, Types } from "mongoose";

export enum PromocodeDicountType {
    PERCENTAGE = "PERCENTAGE",
    FLAT = "FLAT"
}

export enum PromoCodeStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SCHEDULED = "scheduled",
    EXPIRED = "expired",
    LIMIT_REACHED = "limit_reached"
}

export interface IPromoCode {
    code: string;
    description?: string;
    discountType: PromocodeDicountType;
    discountValue: number;
    maxDiscountAmount?: number;
    minCartValue?: number;
    startDate?: Date;
    endDate?: Date;
    usageLimit?: number;
    usedCount?: number;
    perUserLimit?: number;
    isActive: boolean;
    createdBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPromoCodeDocument extends IPromoCode, Document {
    validatePromoCode(cartTotal: number): void;
    calculatePromoDiscount(cartTotal: number): number;
    getStatus(): PromoCodeStatus;
    getRemainingUsage(): number | null;
    isExpired(): boolean;
    isScheduled(): boolean;
}

export interface PromoCodeModelType extends Model<IPromoCodeDocument> {
    canBeAppliedByUser(userId: Types.ObjectId, promoCode: string): Promise<boolean>;
}