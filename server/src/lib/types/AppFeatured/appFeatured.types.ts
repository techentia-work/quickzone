import { Document, Model, Schema } from "mongoose";

export enum AppTypeOfFeatured {
  BANNER = "BANNER",
  SLIDER = "SLIDER",
  FEATURED = "FEATURED",
  BRAND = "BRAND",
}

export interface AppMappingItem {
  type: "CATEGORY" | "SUBCATEGORY" | "PRODUCT" | "URL" | "BRAND";
  refId?: Schema.Types.ObjectId | null;
  imageUrl?: string | null;   // ✅ per-slot image
  externalUrl?: string | null;
}

export interface IAppFeaturedDocument extends Document {
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;

  order: number;
  gridCount: number;   // ✅ 5 or 6
  position:
    | "TOP" | "MIDDLE" | "BOTTOM"
    | "APP" | "APP1" | "APP2" | "APP3"
    | "APP4" | "APP5" | "APP6" | "APP7" | "APP8";
  color: string;
  type: AppTypeOfFeatured;

  mappings: AppMappingItem[];

  masterCategory?: Schema.Types.ObjectId | null;
  superCategory?: Schema.Types.ObjectId | null;
  category?: Schema.Types.ObjectId[] | null;
  subcategory?: Schema.Types.ObjectId[] | null;

  isClickable: boolean;
  isActive: boolean;
  isDeleted: boolean;
  mapType: "SUBCATEGORY" | "PRODUCT" | "NONE";

  metaTitle?: string;
  metaDescription?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface AppFeaturedModelType
  extends Model<IAppFeaturedDocument> {}
