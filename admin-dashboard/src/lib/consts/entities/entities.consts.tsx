"use client";

// @/lib/config/entitySchema.ts
import { FilterSchema, EntityType } from "@/lib/types";

import { productEntitySchema } from "./product.schema";
import { categoryEntitySchema } from "./category.schema";
import { orderEntitySchema } from "./order.schema";
import { featuredEntitySchema } from "./featured.schema";
import { deliveryBoyEntitySchema } from "./deliveryBoy.schema";
import { promoEntitySchema } from "./promo.schema";
import { bannerEntitySchema } from "./banner.schema";
import { sliderEntitySchema } from "./slider.schema";
import { walletEntitySchema } from "./wallet.schema";
import { transactionEntitySchema } from "./transaction.schema";
import { userEntitySchema } from "./user.schema";
import { showcaseProductEntitySchema } from "./showCaseProdcuts.schema";
import { brandEntitySchema } from "./brand.schema";

/* ✅ Featured Week Brand */
import { featuredWeekBrandEntitySchema } from "./featuredWeekBrand.schema";

/* ✅ Shop By Store */
import { shopByStoreEntitySchema } from "./shopByStore.schema";
import { brandOfTheDayEntitySchema } from "./brandOfTheDay.schema";

export const entitySchema: Record<EntityType, FilterSchema> = {
  product: productEntitySchema,
  category: categoryEntitySchema,
  order: orderEntitySchema,
  featured: featuredEntitySchema,
  deliveryBoy: deliveryBoyEntitySchema,
  promo: promoEntitySchema,
  banner: bannerEntitySchema,
  slider: sliderEntitySchema,
  wallet: walletEntitySchema,
  transaction: transactionEntitySchema,
  user: userEntitySchema,
  showcaseProduct: showcaseProductEntitySchema,
  brand: brandEntitySchema,

  /* ✅ FEATURED */
  featuredWeekBrand: featuredWeekBrandEntitySchema,

  /* ✅ SHOP BY STORE (FINAL MISSING PIECE) */
  shopByStore: shopByStoreEntitySchema,
  brandOfTheDay: brandOfTheDayEntitySchema,
};


