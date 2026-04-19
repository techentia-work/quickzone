import { z } from "zod";
import mongoose from "mongoose";
import { TypeOfFeatured } from "../../types/featured/featured.types";

// ✅ Helper for ObjectId or null
const objectId = z.preprocess(
  (val) => {
    if (val === "" || val === undefined || val === null) return null;
    return val;
  },
  z
    .string()
    .refine((val) => val === null || mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid MongoDB ObjectId",
    })
    .nullable()
);

// ✅ Position enum
const positionEnum = z.enum(["TOP", "MIDDLE", "BOTTOM", "APP"]);

// ✅ MapType enum
const mapTypeEnum = z.enum(["NONE", "PRODUCT", "SUBCATEGORY", "CATEGORY"]);

// ✅ CREATE SCHEMA
export const createBannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Banner image is required"),

  type: z
    .enum(Object.values(TypeOfFeatured))
    .default(TypeOfFeatured.BANNER),

  // ✅ ADD THESE CATEGORY FIELDS
  masterCategory: objectId.optional(),
  category: objectId.optional(),
  subcategory: objectId.optional(),

  // ✅ ADD POSITION AND MAPTYPE
  position: positionEnum.optional().default("TOP"),
  mapType: mapTypeEnum.optional().default("NONE"),

  link: z.string().url().optional(),
  color: z.string().optional(),

  order: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .optional()
    .default(0),
  
  isClickable: z.boolean().optional().default(false),
  
  metaTitle: z.string().optional(),
  metaKeywords: z.string().optional(),
  metaDescription: z.string().optional(),

  isActive: z.boolean().optional().default(true),
  isDeleted: z.boolean().optional().default(false),
  deletedAt: z.string().nullable().optional(),

  // ✅ For mappings array (if needed)
  mappings: z.array(z.object({
    type: z.enum(["PRODUCT", "SUBCATEGORY"]),
    refId: z.string(),
  })).optional().default([]),
});

// ✅ UPDATE SCHEMA
export const updateBannerSchema = createBannerSchema.partial();

// ✅ ID PARAM SCHEMA
export const bannerIdParamSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ObjectId",
  }),
});

// ✅ QUERY SCHEMA
export const bannerQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v) : 20)),
  position: positionEnum.optional(),
  isActive: z.string().optional(),
  isDeleted: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ✅ BULK UPDATE SCHEMA
export const bulkUpdateBannerSchema = z.object({
  bannerIds: z.array(z.string().refine((val) => mongoose.Types.ObjectId.isValid(val))),
  updateData: z.object({
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    deletedAt: z.string().nullable().optional(),
  }),
});

export const bannerSchema = {
  createBannerSchema,
  updateBannerSchema,
  bannerIdParamSchema,
  bannerQuerySchema,
  bulkUpdateBannerSchema,
};
