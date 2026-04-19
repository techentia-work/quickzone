import { z } from "zod";
import { PromocodeDicountType } from "../../types/index";

export const createPromoSchema = z.object({
    code: z.string()
        .min(3, "Code must be at least 3 characters")
        .max(50, "Code must not exceed 50 characters")
        .regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, hyphens, and underscores"),

    description: z.string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),

    discountType: z.enum(Object.values(PromocodeDicountType)).refine(v => Object.values(PromocodeDicountType).includes(v), "Discount type must be either PERCENTAGE or FLAT"),

    discountValue: z.number()
        .positive("Discount value must be positive")
        .refine((val) => val > 0, "Discount value must be greater than 0"),

    maxDiscountAmount: z.number()
        .positive("Max discount amount must be positive")
        .optional()
        .nullable(),

    minCartValue: z.number()
        .min(0, "Minimum cart value cannot be negative")
        .optional()
        .nullable(),

    startDate: z.string()
        .date("Invalid start date format")
        .optional()
        .nullable(),

    endDate: z.string()
        .date("Invalid end date format")
        .optional()
        .nullable(),

    usageLimit: z.number()
        .int("Usage limit must be an integer")
        .positive("Usage limit must be positive")
        .optional()
        .nullable(),

    perUserLimit: z.number()
        .int("Per user limit must be an integer")
        .positive("Per user limit must be positive")
        .optional()
        .nullable(),

    isActive: z.boolean()
        .default(true)
        .optional()
}).refine(
    (data) => {
        if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
            return false;
        }
        return true;
    },
    {
        message: "Percentage discount cannot exceed 100%",
        path: ["discountValue"]
    }
).refine(
    (data) => {
        if (data.discountType === "FLAT" && data.maxDiscountAmount) {
            return false;
        }
        return true;
    },
    {
        message: "Max discount amount is only applicable for percentage discounts",
        path: ["maxDiscountAmount"]
    }
).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            return end > start;
        }
        return true;
    },
    {
        message: "End date must be after start date",
        path: ["endDate"]
    }
);

export const updatePromoSchema = z.object({
    code: z.string()
        .min(3, "Code must be at least 3 characters")
        .max(50, "Code must not exceed 50 characters")
        .regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, hyphens, and underscores")
        .optional(),

    description: z.string()
        .max(500, "Description must not exceed 500 characters")
        .optional()
        .nullable(),

    discountType: z.enum(PromocodeDicountType)
        .optional(),

    discountValue: z.number()
        .positive("Discount value must be positive")
        .optional(),

    maxDiscountAmount: z.number()
        .positive("Max discount amount must be positive")
        .optional()
        .nullable(),

    minCartValue: z.number()
        .min(0, "Minimum cart value cannot be negative")
        .optional()
        .nullable(),

    startDate: z.string()
        .datetime("Invalid start date format")
        .optional()
        .nullable(),

    endDate: z.string()
        .datetime("Invalid end date format")
        .optional()
        .nullable(),

    usageLimit: z.number()
        .int("Usage limit must be an integer")
        .positive("Usage limit must be positive")
        .optional()
        .nullable(),

    perUserLimit: z.number()
        .int("Per user limit must be an integer")
        .positive("Per user limit must be positive")
        .optional()
        .nullable(),

    isActive: z.boolean()
        .optional()
}).refine(
    (data) => {
        if (data.discountType === "PERCENTAGE" && data.discountValue && data.discountValue > 100) {
            return false;
        }
        return true;
    },
    {
        message: "Percentage discount cannot exceed 100%",
        path: ["discountValue"]
    }
);

export const applyPromoSchema = z.object({
    code: z.string()
        .min(3, "Code must be at least 3 characters")
        .trim()
        .transform(val => val.toUpperCase())
});

export const bulkCreatePromoSchema = z.object({
    prefix: z.string()
        .min(2, "Prefix must be at least 2 characters")
        .max(20, "Prefix must not exceed 20 characters")
        .regex(/^[A-Z0-9]+$/i, "Prefix can only contain letters and numbers"),

    count: z.number()
        .int("Count must be an integer")
        .min(1, "Count must be at least 1")
        .max(100, "Cannot create more than 100 promo codes at once"),

    description: z.string()
        .max(500, "Description must not exceed 500 characters")
        .optional(),

    discountType: z.enum(PromocodeDicountType),

    discountValue: z.number()
        .positive("Discount value must be positive"),

    maxDiscountAmount: z.number()
        .positive("Max discount amount must be positive")
        .optional()
        .nullable(),

    minCartValue: z.number()
        .min(0, "Minimum cart value cannot be negative")
        .optional()
        .nullable(),

    startDate: z.string()
        .datetime("Invalid start date format")
        .optional()
        .nullable(),

    endDate: z.string()
        .datetime("Invalid end date format")
        .optional()
        .nullable(),

    usageLimit: z.number()
        .int("Usage limit must be an integer")
        .positive("Usage limit must be positive")
        .optional()
        .nullable(),

    perUserLimit: z.number()
        .int("Per user limit must be an integer")
        .positive("Per user limit must be positive")
        .optional()
        .nullable(),

    isActive: z.boolean()
        .default(true)
        .optional()
}).refine(
    (data) => {
        if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
            return false;
        }
        return true;
    },
    {
        message: "Percentage discount cannot exceed 100%",
        path: ["discountValue"]
    }
);

export const promoIdParamSchema = z.object({
    id: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid promo code ID format")
});

export const promoQuerySchema = z.object({
    page: z.string()
        .regex(/^\d+$/)
        .transform(Number)
        .optional(),

    limit: z.string()
        .regex(/^\d+$/)
        .transform(Number)
        .optional(),

    isActive: z.enum(["true", "false"])
        .optional(),

    discountType: z.enum(PromocodeDicountType)
        .optional(),

    search: z.string()
        .optional(),

    sortBy: z.enum(["createdAt", "code", "discountValue", "usedCount"])
        .default("createdAt")
        .optional(),

    sortOrder: z.enum(["asc", "desc"])
        .default("desc")
        .optional()
});

export const promocodeSchema = {
    createPromoSchema,
    updatePromoSchema,
    applyPromoSchema,
    bulkCreatePromoSchema,
    promoIdParamSchema,
    promoQuerySchema
};
