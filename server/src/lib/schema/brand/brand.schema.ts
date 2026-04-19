import { z } from "zod";

const cleanNullableString = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
        if (v === null || v === undefined) return undefined;
        if (typeof v === "string" && v.trim() === "") return undefined; // ⭐ FIX
        return v;
    });

const baseBrandSchema = z.object({
    name: z.string().min(2),
    slug: cleanNullableString,
    banner: cleanNullableString,
    thumbnail: cleanNullableString,
    isActive: z
        .union([z.boolean(), z.string(), z.null(), z.undefined()])
        .transform((v) => {
            if (v === null || v === undefined) return undefined;
            if (typeof v === "boolean") return v;
            return v === "true";
        }),
});

export const createBrandSchema = baseBrandSchema.transform((data) => {
    const rawSlug = data.slug ?? data.name;

    const slug = rawSlug.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-");

    return { ...data, slug };
});

export const updateBrandSchema = baseBrandSchema
    .partial()
    .transform((data) => {
        if (data.slug) {
            const slug = data.slug.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-");
            return { ...data, slug };
        }
        return data;
    });


export const brandSchema = {
    createBrandSchema,
    updateBrandSchema,
};
