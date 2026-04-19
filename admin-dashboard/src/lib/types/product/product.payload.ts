import { TaxRateType } from "../order/order.enums";
import { ProductStatus } from "./product.enums";
import { ProductBase, ProductVariantBase } from "./product.types";

// Payload Types for API requests
export interface CreateVariantPayload
  extends Omit<
    ProductVariantBase,
    "price" | "mrp" | "discountPercent" | "stock" | "measurement"
  > {
  price?: number | null;
  mrp?: number | null;
  discountPercent?: number | null;
  stock?: number | null;
  measurement?: number | null;
}

export type CreateProductPayload = Omit<
  ProductBase,
  "isApproved" | "isActive" | "variants" | "categoryPath"
> & {
  isApproved?: boolean;
  isActive?: boolean;
  variants: CreateVariantPayload[];
};

export type UpdateProductPayload = Omit<Partial<CreateProductPayload>, "variants"> & {
  variants: CreateVariantPayload[];
};

export interface BulkUpdateProductsPayload {
  productIds: string[];
  updateData: {
    status?: ProductStatus;
    isActive?: boolean;
    taxRate?: TaxRateType | string;
    isReturnable?: boolean;
    isCOD?: boolean;
    isCancelable?: boolean;
    isApproved?: boolean;
  };
}

export type UpdateVariantPayload = Partial<ProductVariantBase>;

export interface VariantFormErrors {
  sku?: string;
  price?: string;
  title?: string;
  measurement?: string;
  stock?: string;
  variantType?: string;
  [key: string]: string | undefined;
}

export interface ProductFormErrors {
  name?: string;
  slug?: string;
  categoryId?: string;
  brandId?: string;
  maxQtyPerUser?: string;
  metaTitle?: string;
  metaDescription?: string;
  images?: string;
  mainImage?: string;
  productType?: string;
  status?: string;
  taxRate?: string;
  sellerId?: string;
  categoryPath?: string;
  tags?: string;
  description?: string;
  shortDescription?: string;
  metaKeywords?: string;
  manufacturer?: string;
  madeIn?: string;
  fssaiNumber?: string;
  barcode?: string;
  isReturnable?: string;
  isCOD?: string;
  isCancelable?: string;
  isApproved?: string;
  isActive?: string;
  ratings?: string;
  popularity?: string;
  searchKeywords?: string;
  variants?: { [index: number]: VariantFormErrors };
  variant? : string
  [key: string]: string | { [index: number]: VariantFormErrors } | undefined;
}
