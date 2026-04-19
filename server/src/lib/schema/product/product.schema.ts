import { z } from "zod";
import mongoose from "mongoose";
import {
  AppError,
  ProductEatableType,
  ProductStatus,
  TaxRateType,
  VariantInventoryType,
  VariantQuantityType,
  VariantStatus,
} from "../../types/index";

const toOptionalNumber = z.any().transform((val) => {
  if (val === null || val === undefined) return undefined;
  if (val === "") return undefined;

  const num = Number(val);
  return isNaN(num) ? undefined : num;
});

// ---------------- VARIANT SCHEMA ----------------
export const variantSchema = z.object({
  title: z.string().optional(),
  sku: z.string(),
  variantType: z.string().optional(),
  measurement: toOptionalNumber,
  measurementUnit: z.string().optional(),
  price: z.number(),
  mrp: toOptionalNumber,
  discountPercent: toOptionalNumber,
  discountedPrice: z.number().optional(),
  stock: toOptionalNumber,
  inventoryType: z
    .enum(Object.values(VariantInventoryType) as [string, ...string[]])
    .optional(),
  status: z
    .enum(Object.values(VariantStatus) as [string, ...string[]])
    .optional(),
  images: z.array(z.string()).optional(),
});

// ---------------- PRODUCT CREATE SCHEMA ----------------
export const createProductSchema = z.object({
  name: z.string(),
  slug: z.string(),
  sellerId: z.string().nullable().optional().refine((val) => !val || mongoose.Types.ObjectId.isValid(val), "Invalid seller ID"),
  brandId: z.string().optional().refine((val) => !val || mongoose.Types.ObjectId.isValid(val), "Invalid brand ID"),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  mainImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z
    .string()
    .refine(
      (val) => mongoose.Types.ObjectId.isValid(val),
      "Invalid category ID"
    ),
  productType: z
    .enum(Object.values(ProductEatableType) as [string, ...string[]])
    .optional(),
  manufacturer: z.string().optional(),
  madeIn: z.string().optional(),
  fssaiNumber: z.string().optional(),
  barcode: z.string().optional(),
  maxQtyPerUser: toOptionalNumber,
  isReturnable: z.boolean().optional(),
  isCOD: z.boolean().optional(),
  isCancelable: z.boolean().optional(),
  status: z
    .enum(Object.values(ProductStatus) as [string, ...string[]])
    .optional(),
  variants: z.array(variantSchema).min(1, "Minimum 1 variant is required"),
  taxRate: z.enum(Object.values(TaxRateType)).optional(),
  isApproved: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ---------------- PARAM SCHEMA ----------------
export const productIdParamSchema = z.object({
  id: z
    .string()
    .refine(
      (val) => mongoose.Types.ObjectId.isValid(val),
      "Invalid product ID"
    ),
});

// ---------------- QUERY SCHEMA ----------------
export const productQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  category: z.string().optional(),
  seller: z.string().optional(),
  status: z
    .enum(Object.values(ProductStatus) as [string, ...string[]])
    .optional(),
  isActive: z.string().optional(),
  search: z.string().optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  brand: z.string().optional(),
  productType: z
    .enum(Object.values(ProductEatableType) as [string, ...string[]])
    .optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  inStock: z.string().optional(),
  includeSubcategories: z.string().optional(),
});

// ---------------- BULK UPDATE SCHEMA ----------------
export const bulkUpdateProductsSchema = z.object({
  productIds: z.array(
    z
      .string()
      .refine(
        (val) => mongoose.Types.ObjectId.isValid(val),
        "Invalid product ID"
      )
  ),
  updateData: z.object({
    status: z
      .enum(Object.values(ProductStatus) as [string, ...string[]])
      .optional(),
    isActive: z.boolean().optional(),

    taxRate: z
      .preprocess(
        (val) => (typeof val === "string" ? val : String(val)),
        z.enum(["5", "12", "18", "28"]).transform((v) => Number(v))
      )
      .optional(),

    isReturnable: z.boolean().optional(),
    isCOD: z.boolean().optional(),
    isCancelable: z.boolean().optional(),
  }),
});

// ---------------- VARIANT UPDATE SCHEMA ----------------
export const updateVariantSchema = z.object({
  title: z.string().optional(),
  sku: z.string().optional(),
variantType: z.string().default("packet"),
  measurement: toOptionalNumber,
  measurementUnit: z.string().optional(),
  price: toOptionalNumber,
  mrp: toOptionalNumber,
  discountPercent: toOptionalNumber,
  stock: toOptionalNumber,
  inventoryType: z
    .enum(Object.values(VariantInventoryType) as [string, ...string[]])
    .optional(),
  status: z
    .enum(Object.values(VariantStatus) as [string, ...string[]])
    .optional(),
  images: z.array(z.string()).optional(),
});

// ---------------- EXPORT ----------------
export const productSchema = {
  createProductSchema,
  variantSchema,
  updateProductSchema,
  updateVariantSchema,
  bulkUpdateProductsSchema,
};
