import mongoose from "mongoose";

/**
 * Fixed showcase types (for reference / UI)
 */
export const FIXED_SHOWCASE_TYPES = {
  NEW_IN_STORE: "NEW_IN_STORE",
  BEST_DEALS: "BEST_DEALS",
  PREMIUM: "PREMIUM",
  HOT_DEALS: "HOT_DEALS",
  TRENDING_NEAR_YOU: "TRENDING_NEAR_YOU",
  PRICE_DROP: "PRICE_DROP",
  TOP_PICKS: "TOP_PICKS",
  QUICK_ESSENTIALS: "QUICK_ESSENTIALS",
  BEST_SELLERS: "BEST_SELLERS",
  NEW_ARRIVALS: "NEW_ARRIVALS",
  MOST_ORDERED: "MOST_ORDERED",
  TRENDING_YOUR_CITY: "TRENDING_YOUR_CITY",
} as const;

export type FixedShowcaseType =
  typeof FIXED_SHOWCASE_TYPES[keyof typeof FIXED_SHOWCASE_TYPES];

/**
 * Showcase Product Document
 */
export interface IShowcaseProductDocument extends mongoose.Document {
  /**
   * Can be:
   * - NEW_IN_STORE
   * - BEST_DEALS
   * - PREMIUM
   * - Apple / Samsung / Nike / etc (FeaturedThisBrand)
   */
  subCategories: mongoose.Types.ObjectId[];

  // ✅ MULTIPLE PRODUCTS
  products: mongoose.Types.ObjectId[];
  showcaseType: string;
  masterCategory: mongoose.Types.ObjectId;

  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
