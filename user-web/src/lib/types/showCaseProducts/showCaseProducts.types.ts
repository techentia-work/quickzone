export type ShowcaseType =
  | "NEW_IN_STORE"
  | "BEST_DEALS"
  | "PREMIUM";

export interface ShowcaseProductItem {
  _id: string;
  name: string;
  slug: string;
  mainImage?: string;
  thumbnail?: string;
  images?: string[];

  variants?: {
    _id: string;
    price?: number;
    mrp?: number;
    discountedPrice?: number;
    weight?: string;
    unit?: string;
  }[];

  masterCategoryId?: string;
  category?: {
    masterCategory?: {
      _id: string;
    };
  };
}

export interface ShowcaseProductType {
  _id: string;
  showcaseType: ShowcaseType;

  /** ✅ ARRAY OF PRODUCTS */
  products: ShowcaseProductItem[];

  masterCategory?: {
    _id: string;
    name: string;
    slug: string;
  } | null;

  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ================= PAYLOADS ================= */

export interface CreateShowcaseProductPayload {
  showcaseType: ShowcaseType;
  masterCategoryId: string;
  subCategoryIds: string[];
  productIds: string[];
}

export interface UpdateShowcaseProductPayload
  extends Partial<CreateShowcaseProductPayload> {
  isActive?: boolean;
}
