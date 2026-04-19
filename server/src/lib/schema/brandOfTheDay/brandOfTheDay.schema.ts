import { z } from "zod";

/* ================= HELPERS ================= */
const cleanNullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "string" && v.trim() === "") return undefined;
    return v;
  });

/* ================= BASE ================= */
const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"), // ✅ ADD THIS

  title: z.string().min(2, "Title must be at least 2 characters"),

  websiteUrl: z.string().url("Invalid website URL"),

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

/* ================= CREATE ================= */
export const createBrandOfTheDaySchema = baseSchema;

/* ================= UPDATE ================= */
export const updateBrandOfTheDaySchema = baseSchema.partial();

/* ================= EXPORT ================= */
export const brandOfTheDaySchema = {
  createBrandOfTheDaySchema,
  updateBrandOfTheDaySchema,
};
