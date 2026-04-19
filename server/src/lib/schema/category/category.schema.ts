// lib/schema/categorySchema.ts - Updated schemas
import { z } from "zod";
import mongoose from "mongoose";
import { TypeOfCategory } from "../../types/index";

export const createCategorySchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(100, "Slug too long")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens"
      ),
    subtitle: z.string().max(200, "Subtitle too long").optional(),
    thumbnail: z.string().url("Invalid thumbnail URL").optional(),
    metaTitle: z.string().max(60, "Meta title too long").optional(),
    metaKeywords: z.string().max(200, "Meta keywords too long").optional(),
    metaDescription: z
      .string()
      .max(160, "Meta description too long")
      .optional(),
    markup: z.string().optional(),
    type: z.enum(Object.values(TypeOfCategory)),
    parent: z.union([z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid parent ID"), z.literal(""),]).optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.parent === "") {
      data.parent = undefined;
    }

    if (data.type) {
      if (data.type !== TypeOfCategory.MASTER && !data.parent) {
        ctx.addIssue({ code: "custom", message: "Parent is required for non-MASTER categories", path: ["parent"], });
      }

      if (data.type === TypeOfCategory.MASTER && data.parent) {
        ctx.addIssue({ code: "custom", message: "MASTER category can't have a parent", path: ["parent"], });
      }
    }
  });

export const updateCategorySchema = createCategorySchema
  .partial()
  .superRefine((data, ctx) => {
    if (data.parent === "") {
      data.parent = undefined;
    }

    if (data.type) {
      if (data.type !== TypeOfCategory.MASTER && !data.parent) {
        ctx.addIssue({ code: "custom", message: "Parent is required for non-MASTER categories", path: ["parent"], });
      }

      if (data.type === TypeOfCategory.MASTER && data.parent) {
        ctx.addIssue({ code: "custom", message: "MASTER category can't have a parent", path: ["parent"], });
      }
    }
  });

export const categoryIdParamSchema = z.object({
  id: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ID"),
});

export const getCategoriesQuerySchema = z
  .object({
    type: z
      .enum([TypeOfCategory.CATEGORY, TypeOfCategory.SUBCATEGORY])
      .optional(),
    parent: z.string().optional(),
    includeDeleted: z.string().optional(),
    page: z.string().min(1).optional(),
    limit: z.string().min(1).max(100).optional(),
    sortBy: z
      .enum(["name", "slug", "order", "level", "createdAt", "updatedAt"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    level: z.string().min(1).optional(),
    search: z.string().max(100).optional(),
    isActive: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    page: data.page ? parseInt(data.page) : undefined,
    limit: data.limit ? parseInt(data.limit) : undefined,
    level: data.level ? parseInt(data.level) : undefined,
    includeDeleted: data.includeDeleted === "true",
    isActive: data.isActive === "true",
  }));
