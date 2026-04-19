import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid Brand ID",
});

export const createAppBrandSchema = z.object({
  brand: objectIdSchema,
  masterCategory: objectIdSchema.optional().nullable(),
  order: z.union([z.number(), z.string()]).transform((val) => Number(val)).default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateAppBrandSchema = createAppBrandSchema.partial();
