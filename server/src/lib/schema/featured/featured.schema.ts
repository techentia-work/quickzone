import { z } from "zod";
import mongoose from "mongoose";

/* ------------------ ObjectId Helper ------------------ */
const objectId = z.preprocess(
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

/* ------------------ Hex Color ------------------ */
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #ffffff)")
  .optional()
  .default("#ffffff");

/* ------------------ Create Featured ------------------ */
export const createFeaturedSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),

  description: z.string().optional(),

  imageUrl: z.string().optional(),
  imageUrl1: z.string().optional(), // ✅ NEW OPTIONAL IMAGE

  link: z.string().optional(),

  color: hexColorSchema,

  /* ---------- Categories ---------- */
  masterCategory: objectId.optional(),
  superCategory: objectId.optional(),

  category: z
    .union([objectId, z.array(objectId)])
    .optional()
    .transform((val) => (Array.isArray(val) ? val : val ? [val] : [])),

  subcategory: z
    .union([objectId, z.array(objectId)])
    .optional()
    .transform((val) => (Array.isArray(val) ? val : val ? [val] : [])),

  /* ---------- Mapping ---------- */
  mapType: z
    .enum(["SUBCATEGORY", "PRODUCT", "CATEGORY", "NONE"])
    .optional()
    .default("NONE"),

  mappings: z
    .array(
      z.object({
        type: z.enum(["SUBCATEGORY", "PRODUCT", "CATEGORY"]),
        refId: objectId,
      })
    )
    .optional()
    .default([]),

  /* ---------- SEO ---------- */
  metaTitle: z.string().optional(),
  metaKeywords: z.string().optional(),
  metaDescription: z.string().optional(),

  /* ---------- Flags ---------- */
  isActive: z.boolean().optional().default(true),
  isMappable: z.boolean().optional().default(false),
  isDeleted: z.boolean().optional().default(false),

  deletedAt: z.string().nullable().optional(),

  /* ---------- Ordering ---------- */
  order: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .optional()
    .default(0),

  position: z
    .enum([
      "TOP",
      "MIDDLE",
      "BOTTOM",
      "APP",
      "APP1",
      "APP2",
      "APP3",
      "APP4",
      "APP5",
      "APP6",
      "APP7",
      "APP8",
    ])
    .optional()
    .default("TOP"),
});

/* ------------------ Update Featured ------------------ */
export const updateFeaturedSchema = createFeaturedSchema.partial();

/* ------------------ Params ------------------ */
export const featuredIdParamSchema = z.object({
  id: objectId,
});

/* ------------------ Query ------------------ */
export const featuredQuerySchema = z.object({
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

/* ------------------ Bulk Update ------------------ */
export const bulkUpdateFeaturedSchema = z.object({
  featuredIds: z.array(objectId),
  updateData: z.object({
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    deletedAt: z.string().nullable().optional(),
    color: hexColorSchema,
  }),
});

/* ------------------ Export ------------------ */
export const featuredSchema = {
  createFeaturedSchema,
  updateFeaturedSchema,
  featuredIdParamSchema,
  featuredQuerySchema,
  bulkUpdateFeaturedSchema,
};
