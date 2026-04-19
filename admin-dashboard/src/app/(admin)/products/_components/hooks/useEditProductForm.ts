"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
    UpdateProductPayload,
    ProductFormErrors,
    ProductEatableType,
    ProductStatus,
    TaxRateType,
    VariantInventoryType,
    VariantQuantityType,
    VariantStatus,
    UpdateVariantPayload,
} from "@/lib/types";
import { useAdminCategory, useAdminProduct, useAdminBrand } from "@/hooks";

interface ImageFile {
    file?: File;
    preview: string;   // url or objectURL
    isMain: boolean;
    uploaded?: boolean; // true if already stored on server
}

export function useEditProductForm(productId: string) {
    const { getProductById } = useAdminProduct();
    const { brandList: brands } = useAdminBrand();
    const { categoryTree } = useAdminCategory(undefined, "type=CATEGORY");

    const [formData, setFormData] = useState<UpdateProductPayload | null>(null);
    const [errors, setErrors] = useState<ProductFormErrors>({});
    const [loading, setLoading] = useState(true);

    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [selectedParentCategory, setSelectedParentCategory] = useState("");

    // parent categories
    const parentCategories = useMemo(
        () => categoryTree.filter((c) => !c.isDeleted && c.isActive),
        [categoryTree]
    );

    // sub categories of selected parent
    const subCategories = useMemo(() => {
        if (!selectedParentCategory) return [];
        const parent = parentCategories.find((p) => p._id === selectedParentCategory);
        return parent?.children?.filter((c: any) => c.isActive && !c.isDeleted) || [];
    }, [selectedParentCategory, parentCategories]);

    // load product
    useEffect(() => {
        (async () => {
            setLoading(true);
            const p = await getProductById(productId);
            if (!p) {
                setLoading(false);
                return;
            }

            // normalize brand & category
            const normalized: UpdateProductPayload = {
                ...p,
                brandId: p.brandId?._id || "",
                categoryId: p.categoryId?._id || "",
                images: p.images || [],
                mainImage: p.mainImage || "",
                tags: p.tags || [],
                searchKeywords: p.searchKeywords || [],
                productType: p.productType || ProductEatableType.NONE,
                status: p.status || ProductStatus.PENDING,
                taxRate: p.taxRate || TaxRateType.GST_5,
                maxQtyPerUser: p.maxQtyPerUser ?? 0,
                isReturnable: p.isReturnable ?? true,
                isCOD: p.isCOD ?? true,
                isCancelable: p.isCancelable ?? true,
                variants: Array.isArray(p.variants) ? p.variants.map((v: any) => ({
                    title: v.title ?? "",
                    sku: v.sku ?? "",
                    variantType: v.variantType || VariantQuantityType.PACKET,
                    price: v.price ?? null,
                    mrp: v.mrp ?? null,
                    discountPercent: v.discountPercent ?? null,
                    stock: v.stock ?? null,
                    measurement: v.measurement ?? null,
                    measurementUnit: v.measurementUnit ?? "",
                    inventoryType: v.inventoryType || VariantInventoryType.LIMITED,
                    status: v.status || VariantStatus.AVAILABLE,
                    images: v.images || [],
                })) : [],
            };

            setFormData(normalized);

            // set selected parent category if current category is a child
            const parent = parentCategories.find((par: any) =>
                par.children?.some((c: any) => (c._id === normalized.categoryId))
            );
            setSelectedParentCategory(parent?._id || "");

            // image gallery (existing images)
            const imgs = normalized.images || [];
            setImageFiles(
                imgs.map((url: string) => ({
                    preview: url,
                    isMain: url === normalized.mainImage,
                    uploaded: true,
                }))
            );

            setLoading(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId, parentCategories.length]);

    // helpers
    const updateField = (field: keyof UpdateProductPayload, value: any) => {
        setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
        if (errors[field]) {
            setErrors((e) => {
                const ne = { ...e };
                delete ne[field];
                return ne;
            });
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        let processed: any = value;
        if (type === "checkbox") processed = (e.target as HTMLInputElement).checked;
        if (type === "number") processed = value === "" ? null : Number(value);
        updateField(name as keyof UpdateProductPayload, processed);
    };

    const handleArrayChange = (field: "tags" | "searchKeywords", value: string) => {
        const arr = value.split(",").map((x) => x.trim()).filter(Boolean);
        updateField(field, arr);
    };

    const generateSlug = (s: string) =>
        s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    // images
    const handleAddImageFiles = useCallback((files: File[]) => {
        const mapped: ImageFile[] = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            isMain: false,
            uploaded: false,
        }));

        setImageFiles((prev) => {
            const merged = [...prev, ...mapped];
            if (!merged.some((f) => f.isMain) && merged.length) merged[0].isMain = true;
            return merged;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRemoveImageFile = useCallback((preview: string) => {
        setImageFiles((prev) => {
            const filtered = prev.filter((img) => img.preview !== preview);
            if (filtered.length && !filtered.some((f) => f.isMain)) filtered[0].isMain = true;
            return filtered;
        });
    }, []);

    const handleSetMainImage = useCallback((preview: string) => {
        setImageFiles((prev) => prev.map((i) => ({ ...i, isMain: i.preview === preview })));
    }, []);

    const getFilesForUpload = () =>
        imageFiles.filter((i) => !i.uploaded).map((i) => i.file!) as File[];

    const getFinalImageUrls = (uploadedUrls: string[]) => {
        const final: string[] = [];
        let upIdx = 0;

        imageFiles.forEach((img) => {
            if (img.uploaded) final.push(img.preview);
            else final.push(uploadedUrls[upIdx++]);
        });

        // derive mainImage using current isMain flags
        const main = final.find((_, idx) => imageFiles[idx].isMain) || final[0] || "";
        return { images: final, mainImage: main };
    };

    // category linking
    const handleParentCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedParentCategory(val);
        const parent = parentCategories.find((p) => p._id === val);
        if (!parent?.children?.length) updateField("categoryId", val);
        else updateField("categoryId", "");
    };

    const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateField("categoryId", e.target.value);
    };

    return {
        loading,
        formData,
        setFormData,
        errors,
        setErrors,

        // brands and categories
        brands,
        parentCategories,
        subCategories,
        selectedParentCategory,

        // field helpers
        updateField,
        handleChange,
        handleArrayChange,
        generateSlug,

        // images
        imageFiles,
        handleAddImageFiles,
        handleRemoveImageFile,
        handleSetMainImage,
        getFilesForUpload,
        getFinalImageUrls,

        // categories
        handleParentCategoryChange,
        handleSubCategoryChange,
    };
}
