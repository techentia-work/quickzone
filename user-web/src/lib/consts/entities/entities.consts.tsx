"use client";

// @/lib/config/entitySchema.ts
import { FilterSchema, EntityType } from "@/lib/types";
import { productFilterSchema } from "./product.schema";
import { categoryFilterSchema } from "./category.schema";

export const entitySchema: Record<EntityType, FilterSchema> = {
    product: productFilterSchema,
    category: categoryFilterSchema, 
}