// product.types.ts
import mongoose, { Document, Model } from "mongoose";
import {
  VariantQuantityType,
  ProductEatableType,
  ProductStatus,
  VariantInventoryType,
  VariantStatus,
} from "./product.enums";

export enum TaxRateType {
  GST_5 = "gst_5",
  GST_12 = "gst_12",
  GST_18 = "gst_18",
  GST_28 = "gst_28",
}

export interface IVariant extends Document {
  title?: string;
  sku: string;
  variantType: VariantQuantityType;
  price: number;
  mrp?: number;
  discountPercent?: number;
  discountedPrice?: number;
  stock?: number;
  inventoryType?: VariantInventoryType;
  status?: VariantStatus;
  images?: string[];
  measurement?: number;
  measurementUnit?: string;
}

export interface IProduct {
  name: string;
  slug: string;
  sellerId?: mongoose.Types.ObjectId | null;
  brandId?: mongoose.Types.ObjectId | null;
  categoryId?: mongoose.Types.ObjectId | null;
  categoryPath?: mongoose.Types.ObjectId[];
  tags?: string[];
  images?: string[];
  mainImage?: string;
  description?: string;
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  productType: ProductEatableType;
  manufacturer?: string;
  madeIn?: string;
  fssaiNumber?: string;
  barcode?: string;
  maxQtyPerUser: number;
  isReturnable: boolean;
  isCOD: boolean;
  isCancelable: boolean;
  status: ProductStatus;
  variants: IVariant[];
  ratings?: { avg: number; count: number };
  popularity?: number;
  featured?: boolean;
  searchKeywords?: string[];
  taxRate?: TaxRateType;
  isApproved: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document {}

export interface ProductModelType extends Model<IProductDocument> {
  rebuildCategoryPath(
    categoryId: mongoose.Types.ObjectId | null,
    session: mongoose.ClientSession | null
  ): Promise<void>;
  rebuildProductCategoryPaths(
    categoryId: mongoose.Types.ObjectId | null,
    session: mongoose.ClientSession | null
  ): Promise<void>;
  deleteProductsByCategory(
    categoryId: mongoose.Types.ObjectId | null,
    session?: mongoose.ClientSession | null
  ): Promise<void>;
  restoreProductsByCategory(
    categoryId: mongoose.Types.ObjectId | null,
    session?: mongoose.ClientSession | null
  ): Promise<void>;
}
