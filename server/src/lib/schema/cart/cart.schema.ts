import { z } from "zod";
import mongoose from "mongoose";
import { TaxRateType } from "../../types/index";

export const cartItemSchema = z.object({
    productId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid product ID"),
    variantId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid variant ID"),
    title: z.string().optional(),
    // price: z.number(),
    quantity: z.number().min(1).default(1),
    discountPercent: z.number().optional(),
    taxRate: z.enum(Object.values(TaxRateType) as [string, ...string[]]).optional(),
});

export const addCartItemSchema = cartItemSchema;

export const updateCartItemSchema = z.object({
    variantId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid variant ID"),
    quantity: z.number().min(1),
});

export const cartSchema = {
    addCartItemSchema,
    updateCartItemSchema,
};
