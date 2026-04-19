// ===============================
// FIXED SHOWCASE TYPES
// ===============================
export type FixedShowcaseType =
  | "NEW_IN_STORE"
  | "BEST_DEALS"
  | "PREMIUM"
  | "HOT_DEALS"
  | "TRENDING_NEAR_YOU"
  | "PRICE_DROP"
  | "TOP_PICKS"
  | "QUICK_ESSENTIALS"
  | "BEST_SELLERS"
  | "NEW_ARRIVALS"
  | "MOST_ORDERED"
  | "TRENDING_YOUR_CITY";

// ===============================
// PRODUCT (POPULATED)
// ===============================
export interface ShowcaseProductItem {
  _id: string;
  name: string;
  slug: string;
  mainImage: string;
  price: number;
}

// ===============================
// CATEGORY (MASTER / SUB)
// ===============================
export interface ShowcaseCategory {
  _id: string;
  name: string;
  slug: string;
}

// ===============================
// SHOWCASE PRODUCT RESPONSE
// ===============================
export interface ShowcaseProductType {
  _id: string;

  // FIXED + DYNAMIC (Apple, Samsung, etc.)
  showcaseType: FixedShowcaseType | string;

  // ✅ MULTIPLE PRODUCTS
  products: ShowcaseProductItem[];

  // ✅ MASTER CATEGORY
  masterCategory: ShowcaseCategory;

  // ✅ SUB CATEGORIES (MULTIPLE)
  subCategories: ShowcaseCategory[];

  displayOrder: number;

  isActive: boolean;
  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}

// ===============================
// CREATE PAYLOAD
// ===============================
export interface CreateShowcaseProductPayload {
  showcaseType: FixedShowcaseType | string;

  masterCategoryId: string;

  // ✅ MULTIPLE SUB CATEGORIES
  subCategoryIds: string[];

  // ✅ MULTIPLE PRODUCTS
  productIds: string[];

  displayOrder?: number;
}

// ===============================
// UPDATE PAYLOAD
// ===============================
export interface UpdateShowcaseProductPayload {
  showcaseType?: FixedShowcaseType | string;

  masterCategoryId?: string;

  // 🔁 replace all sub categories
  subCategoryIds?: string[];

  // 🔁 replace all products
  productIds?: string[];

  // ➕ add products
  addProductIds?: string[];

  // ➖ remove products
  removeProductIds?: string[];

  displayOrder?: number;
  isActive?: boolean;
}
