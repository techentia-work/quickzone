import { Document, Model, Types } from "mongoose";

export interface IShopByStore {
  name: string;
  slug: string;
  banner?: string | null;
  thumbnail?: string | null;
  masterCategory?: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShopByStoreDocument
  extends IShopByStore,
    Document {}

export interface ShopByStoreModelType
  extends Model<IShopByStoreDocument> {
  isSlugTaken(slug: string, excludeId?: string): Promise<boolean>;
}