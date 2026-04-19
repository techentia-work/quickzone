// lib/types/featuredWeekBrand.types.ts
import { Document, Model, Types } from "mongoose";

export interface IFeaturedWeekBrand {
  name: string;
  slug: string;
  banner?: string | null;
  thumbnail?: string | null;
  masterCategory?: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeaturedWeekBrandDocument
  extends IFeaturedWeekBrand,
    Document {}

export interface FeaturedWeekBrandModelType
  extends Model<IFeaturedWeekBrandDocument> {
  isSlugTaken(slug: string, excludeId?: string): Promise<boolean>;
}
