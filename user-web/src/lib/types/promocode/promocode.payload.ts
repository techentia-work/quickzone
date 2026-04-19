// lib/types/promocode/promocode.payload.ts

import { PromocodeDiscountType } from "./promocode.enums";

export interface ApplyPromoCodePayload {
  code: string;
  cartTotal: number; // total cart value before applying the code
  userId?: string;
}

export interface AppliedPromoCodeResponse {
  code: string;
  discountType: PromocodeDiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  discountApplied: number; // actual discount value applied
  newTotal: number; // total after applying promo
  message?: string;
}

export interface RemovePromoCodePayload {
  userId?: string;
  code: string;
}
