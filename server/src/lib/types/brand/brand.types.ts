import { Document, Model } from "mongoose";

export interface IBrand {
  name: string;
  slug: string;
  banner?: string | null;
  thumbnail?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrandDocument extends IBrand, Document {}

export interface BrandModelType extends Model<IBrandDocument> {
  isSlugTaken(slug: string, excludeId?: string): Promise<boolean>;
}
