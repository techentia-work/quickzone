import { z } from "zod";
import mongoose from "mongoose";

/* ------------------ ObjectId Helper (APP) ------------------ */
const appObjectId = z.preprocess(
  (val) => {
    if (val === "" || val === undefined) return null;
    return val;
  },
  z
    .string()
    .refine(
      (val) => val === null || mongoose.Types.ObjectId.isValid(val),
      { message: "Invalid MongoDB ObjectId" }
    )
    .nullable()
);

/* ------------------ Hex Color (APP) ------------------ */
const appHexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #ffffff)")
  .optional()
  .default("#ffffff");

/* ------------------ Create App Featured ------------------ */
export const createAppFeaturedSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),

  description: z.string().optional(),
  imageUrl: z.string().optional(),

  color: appHexColorSchema,

  /* ---------- Categories ---------- */
  masterCategory: appObjectId.optional(),
  superCategory: appObjectId.optional(),

  category: z
    .union([appObjectId, z.array(appObjectId)])
    .optional()
    .transform((val) => (Array.isArray(val) ? val : val ? [val] : [])),

  subcategory: z
    .union([appObjectId, z.array(appObjectId)])
    .optional()
    .transform((val) => (Array.isArray(val) ? val : val ? [val] : [])),

  /* ---------- Mapping ---------- */
  mapType: z
    .enum(["SUBCATEGORY", "PRODUCT", "BRAND", "NONE"])
    .optional()
    .default("NONE"),

  mappings: z
    .array(
      z.object({
        type: z.enum(["CATEGORY", "SUBCATEGORY", "PRODUCT", "URL", "BRAND"]),
        refId: appObjectId,
        imageUrl: z.string().optional().nullable(),
        externalUrl: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),

  /* ---------- SEO ---------- */
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),

  /* ---------- Flags ---------- */
  isActive: z.boolean().optional().default(true),
  isClickable: z.boolean().optional().default(false),
  isDeleted: z.boolean().optional().default(false),

  deletedAt: z.string().nullable().optional(),

  /* ---------- Ordering ---------- */
  order: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .optional()
    .default(0),

  gridCount: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .optional()
    .default(6),

  position: z
    .enum(["TOP", "MIDDLE", "BOTTOM", "APP", "APP1", "APP2", "APP3", "APP4", "APP5", "APP6", "APP7", "APP8"])
    .optional()
    .default("APP"),
});

/* ------------------ Update App Featured ------------------ */
export const updateAppFeaturedSchema =
  createAppFeaturedSchema.partial();

/* ------------------ Params ------------------ */
export const appFeaturedIdParamSchema = z.object({
  id: appObjectId,
});

/* ------------------ Query ------------------ */
export const appFeaturedQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),

  isActive: z.string().optional(),
  isDeleted: z.string().optional(),
  search: z.string().optional(),

  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),

  order: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
});

/* ------------------ Bulk Update (APP) ------------------ */
export const bulkUpdateAppFeaturedSchema = z.object({
  featuredIds: z.array(appObjectId),
  updateData: z.object({
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    deletedAt: z.string().nullable().optional(),
    color: appHexColorSchema,
  }),
});

/* ------------------ Export ------------------ */
export const appFeaturedSchema = {
  createAppFeaturedSchema,
  updateAppFeaturedSchema,
  appFeaturedIdParamSchema,
  appFeaturedQuerySchema,
  bulkUpdateAppFeaturedSchema,
};
