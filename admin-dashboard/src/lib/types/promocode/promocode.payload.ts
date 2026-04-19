// src/lib/types/promo/promo.payload.ts

import { DiscountType } from "./promocode.enums";

export interface CreatePromoPayload {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minCartValue?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  usageLimit?: number;
  isDeleted?: boolean;
}

export type UpdatePromoPayload = Partial<CreatePromoPayload>;

export interface BulkCreatePromoPayload {
  promos: CreatePromoPayload[];
}
