// lib/validators/featuredWeekBrand.schema.ts
import { z } from "zod";

const cleanNullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "string" && v.trim() === "") return undefined;
    return v;
  });

const baseSchema = z.object({
  name: z.string().min(2),
  slug: cleanNullableString,
  banner: cleanNullableString,
  thumbnail: cleanNullableString,
  masterCategory: cleanNullableString,
  isActive: z
    .union([z.boolean(), z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === "boolean") return v;
      return v === "true";
    }),
});

export const createFeaturedWeekBrandSchema = baseSchema.transform((data) => {
  const rawSlug = data.slug ?? data.name;

  const slug = rawSlug
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-");

  return { ...data, slug };
});

export const updateFeaturedWeekBrandSchema = baseSchema
  .partial()
  .transform((data) => {
    if (data.slug) {
      data.slug = data.slug
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-");
    }
    return data;
  });

export const featuredWeekBrandSchema = {
  createFeaturedWeekBrandSchema,
  updateFeaturedWeekBrandSchema,
};
