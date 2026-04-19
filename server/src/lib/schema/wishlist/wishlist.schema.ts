// src/lib/schema/wishlist.schema.ts
import { z } from "zod";
import mongoose from "mongoose";

export const wishlistItemSchema = z.object({
  productId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid product ID"),
  variantId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid variant ID"),
  title: z.string().optional(),
});

export const addWishlistItemSchema = wishlistItemSchema;

export const wishlistSchema = {
  addWishlistItemSchema,
};
