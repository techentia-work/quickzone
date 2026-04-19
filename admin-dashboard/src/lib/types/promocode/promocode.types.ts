// src/lib/types/promo/promo.types.ts

import { DiscountType } from "./promocode.enums";

export interface PromoType {
  _id: string;
  code: string;
  discountType: DiscountType;
  description? : string
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoUsageHistory {
  userId: string;
  orderId: string;
  usedAt: string;
  discountApplied: number;
}
