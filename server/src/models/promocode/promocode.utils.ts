import mongoose from "mongoose";
import { IPromoCodeDocument, PromoCodeModelType, AppError, OrderModelType, PromoCodeStatus } from "../../lib/types/index";

const getOrderModel = (): OrderModelType => mongoose.models.Order as OrderModelType;

export const promocodeUtils = {
    statics: {
        async canBeAppliedByUser(this: PromoCodeModelType, userId: mongoose.Types.ObjectId, promoCode: string): Promise<boolean> {
            const Order = getOrderModel();
            const promo = await this.findOne({ code: promoCode.toUpperCase() });
            if (!promo || !promo.perUserLimit) return true;

            const userUsageCount = await Order.countDocuments({
                userId,
                "appliedPromo.code": promoCode.toUpperCase(),
                status: { $nin: ["FAILED"] }
            });

            return userUsageCount < promo.perUserLimit;
        }
    },

    methods: {
        validatePromoCode(this: IPromoCodeDocument, cartTotal: number): void {
            const now = new Date();

            if (!this.isActive) {
                throw new AppError("Promo code is inactive", 400);
            }

            if (this.startDate && this.startDate > now) {
                throw new AppError("Promo code not started yet", 400);
            }

            if (this.endDate && this.endDate < now) {
                throw new AppError("Promo code has expired", 400);
            }

            if (this.usageLimit && this.usedCount !== undefined && this.usedCount >= this.usageLimit) {
                throw new AppError("Promo code usage limit reached", 400);
            }

            if (this.minCartValue && cartTotal < this.minCartValue) {
                throw new AppError(`Minimum cart value should be ₹${this.minCartValue}`, 400);
            }
        },

        calculatePromoDiscount(this: IPromoCodeDocument, cartTotal: number): number {
            let discount = 0;

            if (this.discountType === "PERCENTAGE") {
                discount = (cartTotal * this.discountValue) / 100;
                if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
                    discount = this.maxDiscountAmount;
                }
            } else if (this.discountType === "FLAT") {
                discount = this.discountValue;
            }

            return +Math.min(discount, cartTotal).toFixed(2);
        },

        getStatus(this: IPromoCodeDocument): PromoCodeStatus {
            const now = new Date();

            if (!this.isActive) {
                return PromoCodeStatus.INACTIVE;
            }

            if (this.startDate && this.startDate > now) {
                return PromoCodeStatus.SCHEDULED;
            }

            if (this.endDate && this.endDate < now) {
                return PromoCodeStatus.EXPIRED;
            }

            if (this.usageLimit && this.usedCount !== undefined && this.usedCount >= this.usageLimit) {
                return PromoCodeStatus.LIMIT_REACHED;
            }

            return PromoCodeStatus.ACTIVE;
        },

        getRemainingUsage(this: IPromoCodeDocument): number | null {
            if (!this.usageLimit) return null;
            return Math.max(0, this.usageLimit - (this.usedCount || 0));
        },
        
        isExpired(this: IPromoCodeDocument): boolean {
            if (!this.endDate) return false;
            return this.endDate < new Date();
        },

        isScheduled(this: IPromoCodeDocument): boolean {
            if (!this.startDate) return false;
            return this.startDate > new Date();
        }
    }
};
