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

// ✅ Helper for array of ObjectIds
const objectIdArray = z.preprocess(
  (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
  },
  z.array(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid MongoDB ObjectId in array",
    })
  )
);

// ✅ CREATE SCHEMA
export const createSliderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),

  // 👇 Category fields
  masterCategory: objectId.optional(),
  category: objectId.optional(),
  subcategory: objectIdArray.optional(),

  // 👇 Position field
  position: z.enum(["TOP", "MIDDLE", "BOTTOM", "APP"]).optional().default("TOP"),

  // 👇 optional autoplay / navigation fields for sliders
  autoplay: z.boolean().optional().default(false),
  transitionSpeed: z.number().optional().default(3000),

  type: z
    .enum(Object.values(TypeOfFeatured) as [string, ...string[]])
    .default(TypeOfFeatured.SLIDER),

  order: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .optional()
    .default(0),

  link: z.string().url().optional().or(z.literal("")),

  isActive: z.boolean().optional().default(true),
  isDeleted: z.boolean().optional().default(false),
  deletedAt: z.string().nullable().optional(),
});

// ✅ UPDATE SCHEMA
export const updateSliderSchema = createSliderSchema.partial();

// ✅ ID PARAM SCHEMA
export const sliderIdParamSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid slider ID",
  }),
});

// ✅ QUERY SCHEMA
export const sliderQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v) : 20)),
  position: z.enum(["TOP", "MIDDLE", "BOTTOM", "APP"]).optional(),
  masterCategory: objectId.optional(),
  category: objectId.optional(),
  isActive: z.string().optional(),
  isDeleted: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ✅ BULK UPDATE SCHEMA
export const bulkUpdateSliderSchema = z.object({
  sliderIds: z.array(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId in sliderIds array",
    })
  ),
  updateData: z.object({
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    deletedAt: z.string().nullable().optional(),
  }),
});

export const sliderSchema = {
  createSliderSchema,
  updateSliderSchema,
  sliderIdParamSchema,
  sliderQuerySchema,
  bulkUpdateSliderSchema,
};
