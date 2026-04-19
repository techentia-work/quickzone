// @/lib/types/product/product.types.ts

import { TypeOfCategory } from "../category/category.enums";
import { CategoryBasic } from "../category/category.types";
import { TaxRateType } from "../order/order.enums";
import { VariantQuantityType, ProductEatableType, ProductStatus, VariantInventoryType, VariantStatus } from "./product.enums";

// Base Variant Type (matches backend schema)
export interface ProductVariantBase {
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

// Variant Type with _id (for display)
export interface ProductVariantType extends ProductVariantBase {
    _id: string;
    discountPercent: number;
    discountedPrice: number;
    stock: number;
    inventoryType: VariantInventoryType;
    status: VariantStatus;
    images: string[];
}

// Base Product Type (matches backend schema with string IDs)
export interface ProductBase {
    name: string;
    slug: string;
    sellerId?: string | null;
    brand?: string;
    categoryId: string;
    categoryPath?: string[];
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
    variants: ProductVariantBase[];
    ratings?: { avg: number; count: number };
    popularity?: number;
    searchKeywords?: string[];
    taxRate?: TaxRateType;
    isApproved: boolean;
    isActive: boolean;
}

// Product Type for Display (populated with category and seller info)
export interface ProductType extends Omit<ProductBase, "categoryId" | "variants" | "categoryPath"> {
    _id: string;
    categoryId: {
        _id: string;
        name: string;
        slug: string;
        type: TypeOfCategory;
    };
    categoryPath: CategoryBasic[];
    variants: ProductVariantType[];
    ratings: { avg: number; count: number };
    popularity: number;
    searchKeywords: string[];
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}
