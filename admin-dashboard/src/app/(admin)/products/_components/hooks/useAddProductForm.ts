// @/app/admin/products/_components/hooks/useAddProductForm.ts
import { useState, useCallback, useMemo } from "react";
import { slugify, generateSKU } from "@/lib/utils/helper.client.utils";
import {
  CreateProductPayload,
  CreateVariantPayload,
  ProductEatableType,
  ProductFormErrors,
  ProductStatus,
  TaxRateType,
  VariantFormErrors,
  VariantInventoryType,
  VariantQuantityType,
  VariantStatus,
} from "@/lib/types";
import { useAdminCategory, useAdminProduct } from "@/hooks";

interface ImageFile {
  file: File;
  preview: string;
  isMain: boolean;
}

export const getDefaultCreateForm = (): CreateProductPayload => ({ name: "", slug: "", brandId: "", categoryId: "", tags: [], images: [], mainImage: "", description: "", price: 0, stock: 0, shortDescription: "", metaTitle: "", metaDescription: "", metaKeywords: "", productType: ProductEatableType.NONE, manufacturer: "", madeIn: "", fssaiNumber: "", barcode: "", maxQtyPerUser: 0, isReturnable: true, isCOD: true, isCancelable: true, status: ProductStatus.PENDING, variants: [], searchKeywords: [], taxRate: TaxRateType.GST_5, sellerId: undefined, });
export const getDefaultVariant = (): CreateVariantPayload => ({ title: "", sku: "", variantType: VariantQuantityType.PACKET, price: null, mrp: null, discountPercent: null, stock: null, measurement: null, measurementUnit: "", inventoryType: VariantInventoryType.LIMITED, status: VariantStatus.AVAILABLE, images: [], });
// const defaultCreateForm: CreateProductPayload = { name: "Alphonso Mango", slug: "alphonso-mango", brand: "Tropical Fresh", categoryId: "fruits-001", tags: ["mango", "alphonso", "fruit", "fresh", "summer"], images: ["https://example.com/images/mango1.jpg", "https://example.com/images/mango2.jpg", "https://example.com/images/mango3.jpg", "https://example.com/images/mango4.jpg"], mainImage: "https://example.com/images/mango1.jpg", description: "Experience the rich, sweet flavor of Alphonso Mangoes — the king of fruits. Grown in the sun-drenched orchards of Ratnagiri, each mango is naturally ripened and packed with nutrients.", price: 299, stock: 150, shortDescription: "Premium Alphonso mangoes, naturally ripened and handpicked for the best taste.", metaTitle: "Buy Alphonso Mango Online | Fresh & Juicy", metaDescription: "Shop premium Alphonso mangoes online. Sweet, juicy, and handpicked from Ratnagiri farms. Order fresh mangoes now!", metaKeywords: "alphonso mango, buy mango online, fresh fruits, tropical mango", productType: ProductEatableType.VEG, manufacturer: "Tropical Fresh Farms", madeIn: "India", fssaiNumber: "11521002000456", barcode: "8901234567890", maxQtyPerUser: 5, isReturnable: true, isCOD: true, isCancelable: true, status: ProductStatus.PENDING, variants: [{ title: "Alphonso Mango 1kg Pack", sku: "MNG-1KG-001", variantType: VariantQuantityType.PACKET, price: 299, mrp: 349, discountPercent: 15, stock: 100, measurement: 1, measurementUnit: "kg", inventoryType: VariantInventoryType.LIMITED, status: VariantStatus.AVAILABLE, images: ["https://example.com/images/mango1.jpg", "https://example.com/images/mango2.jpg"] }, { title: "Alphonso Mango 500g Pack", sku: "MNG-500G-002", variantType: VariantQuantityType.PACKET, price: 169, mrp: 199, discountPercent: 15, stock: 50, measurement: 0.5, measurementUnit: "kg", inventoryType: VariantInventoryType.LIMITED, status: VariantStatus.AVAILABLE, images: ["https://example.com/images/mango3.jpg", "https://example.com/images/mango4.jpg"] }], searchKeywords: ["mango", "alphonso", "fresh mango", "ratnagiri mango", "buy mango online"], taxRate: TaxRateType.GST_5, sellerId: undefined };

// export const defaultVariant: CreateVariantPayload = { title: "Alphonso Mango 1kg Pack", sku: "MNG-1KG-001", variantType: VariantQuantityType.PACKET, price: 299, mrp: 349, discountPercent: 15, stock: 100, measurement: 1, measurementUnit: "kg", inventoryType: VariantInventoryType.LIMITED, status: VariantStatus.AVAILABLE, images: ["https://example.com/images/mango1.jpg", "https://example.com/images/mango2.jpg"] };


export function useCreateProductForm() {
  const [formData, setFormData] = useState<CreateProductPayload>(getDefaultCreateForm());
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);

  const [selectedParentCategory, setSelectedParentCategory] = useState('');
  const { categoryTree } = useAdminCategory(undefined, "type=CATEGORY");

  const parentCategories = useMemo(() => {
    return categoryTree.filter(cat => !cat.isDeleted && cat.isActive);
  }, [categoryTree]);

  // Get subcategories for selected parent
  const subCategories = useMemo(() => {
    if (!selectedParentCategory) return [];

    const parent = parentCategories.find(cat => cat._id === selectedParentCategory);
    return parent?.children?.filter(child =>
      !child.isDeleted &&
      child.isActive
    ) || [];
  }, [selectedParentCategory, parentCategories]);

  // Handle parent category change
  const handleParentCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value;
    setSelectedParentCategory(parentId);

    // If parent has no children, set it as the final categoryId
    const parent = parentCategories.find(cat => cat._id === parentId);
    if (!parent?.children?.length) {
      updateField('categoryId', parentId);
    } else {
      // Reset categoryId when parent changes and has children
      updateField('categoryId', '');
    }
  }, [parentCategories]);

  // Handle subcategory change
  const handleSubCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const subCatId = e.target.value;
    updateField('categoryId', subCatId);
  }, []);

  const { pagination } = useAdminProduct("limit=1");

  const generateSlug = useCallback((name: string) => slugify(name), []);

  const autoGenerateSKU = useCallback((variantIndex: number, variantTitle: string) => {
    const nextNum = (pagination?.totalCount ?? 0) + 1;

    setFormData(prev => {
      const variants = [...prev.variants];
      if (variants[variantIndex]) {
        const currentSku = variants[variantIndex].sku;
        if (!currentSku || currentSku.includes("-")) { 
          variants[variantIndex].sku = generateSKU("", prev.name, variantTitle, nextNum);
        }
      }
      return { ...prev, variants };
    });
  }, [pagination]);

  const updateField = (field: keyof CreateProductPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Type-safe error clearing - skip variants as it has special structure
    if (field !== "variants" && errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === "number") processedValue = value === "" ? null : Number(value);
    if (type === "checkbox")
      processedValue = (e.target as HTMLInputElement).checked;

    updateField(name as keyof CreateProductPayload, processedValue);
  };

  // Validate file type
  const validateFileType = (file: File): boolean => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    return allowedTypes.includes(file.type);
  };

  // Validate file size (default 5MB)
  const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
    const maxSize = maxSizeMB * 1024 * 1024;
    return file.size <= maxSize;
  };

  // Add image files (for preview only, not uploaded yet)
  const handleAddImageFiles = useCallback(
    (files: File[]) => {
      const validFiles: ImageFile[] = [];
      const invalidFiles: string[] = [];

      files.forEach((file) => {
        if (!validateFileType(file)) {
          invalidFiles.push(`${file.name}: Invalid file type`);
          return;
        }
        if (!validateFileSize(file, 5)) {
          invalidFiles.push(`${file.name}: File size exceeds 5MB`);
          return;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);
        validFiles.push({ file, preview, isMain: false });
      });

      if (invalidFiles.length > 0) {
        console.warn("Invalid files:", invalidFiles);
      }

      setImageFiles((prev) => {
        const newFiles = [...prev, ...validFiles];
        // Set first image as main if no main image exists
        if (newFiles.length > 0 && !newFiles.some((f) => f.isMain)) {
          newFiles[0].isMain = true;
        }
        return newFiles;
      });

      // Clear any image errors
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }));
      }
    },
    [errors.images]
  );

  // Remove image file
  const handleRemoveImageFile = useCallback((preview: string) => {
    setImageFiles((prev) => {
      const filtered = prev.filter((img) => img.preview !== preview);

      // Revoke object URL to free memory
      URL.revokeObjectURL(preview);

      // If removed image was main, set new main
      if (filtered.length > 0 && !filtered.some((f) => f.isMain)) {
        filtered[0].isMain = true;
      }

      return filtered;
    });
  }, []);

  // Set main image
  const handleSetMainImage = useCallback((preview: string) => {
    setImageFiles((prev) =>
      prev.map((img) => ({ ...img, isMain: img.preview === preview }))
    );
  }, []);

  // Get files ready for upload (returns in order: main image first, then others)
  const getFilesForUpload = useCallback((): File[] => {
    const mainImage = imageFiles.find((img) => img.isMain);
    const otherImages = imageFiles.filter((img) => !img.isMain);

    return [
      ...(mainImage ? [mainImage.file] : []),
      ...otherImages.map((img) => img.file),
    ];
  }, [imageFiles]);

  // Handle arrays (comma separated)
  const handleArrayChange = (
    field: "tags" | "searchKeywords",
    value: string
  ) => {
    const array = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    updateField(field, array);
  };

  const enumValues = {
    productType: Object.values(ProductEatableType),
    status: Object.values(ProductStatus),
    taxRate: Object.values(TaxRateType),
  };

  const variantEnumValues = {
    variantType: Object.values(VariantQuantityType),
    inventoryType: Object.values(VariantInventoryType),
    status: Object.values(VariantStatus),
  };

  const validateForm = (): boolean => {
    const newErrors: ProductFormErrors = {};

    // ------------------ Product validations ------------------
    if (!formData.name?.trim()) newErrors.name = "Product name is required";
    else if (formData.name.length < 2)
      newErrors.name = "Product name must be at least 2 characters";
    else if (formData.name.length > 200)
      newErrors.name = "Product name cannot exceed 200 characters";

    if (!formData.slug?.trim()) newErrors.slug = "Slug is required";
    else if (formData.slug.length < 2)
      newErrors.slug = "Slug must be at least 2 characters";
    else if (formData.slug.length > 200)
      newErrors.slug = "Slug cannot exceed 200 characters";
    else if (!/^[a-z0-9-]+$/.test(formData.slug))
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";

    if (!formData.categoryId?.trim())
      newErrors.categoryId = "Category is required";
    else if (!/^[a-f\d]{24}$/i.test(formData.categoryId))
      newErrors.categoryId = "Invalid category ID";

    if (formData.brandId && formData.brandId?.length > 100)
      newErrors.brand = "Brand name cannot exceed 100 characters";

    if (formData.maxQtyPerUser != null) {
      if (!Number.isInteger(formData.maxQtyPerUser))
        newErrors.maxQtyPerUser = "Max quantity must be a whole number";
      else if (formData.maxQtyPerUser < 1 || formData.maxQtyPerUser > 1000)
        newErrors.maxQtyPerUser = "Max quantity must be between 1 and 1000";
    }

    if (formData.metaTitle && formData.metaTitle.length > 60)
      newErrors.metaTitle =
        "Meta title should not exceed 60 characters for SEO";
    if (formData.metaDescription && formData.metaDescription.length > 160)
      newErrors.metaDescription =
        "Meta description should not exceed 160 characters for SEO";

    if (!imageFiles.length)
      newErrors.images = "At least one product image is required";

    // Validate enums
    if (!enumValues.productType.includes(formData.productType)) {
      newErrors.productType = "Invalid product type";
    }
    if (!enumValues.status.includes(formData.status)) {
      newErrors.status = "Invalid product status";
    }
    if (!formData.taxRate) {
      newErrors.taxRate = "Choose tax rate";
    } else if (!enumValues.taxRate.includes(formData.taxRate)) {
      newErrors.taxRate = "Invalid tax rate";
    }

    if (formData.variants.length == 0) {
      newErrors.variant = "Minimum 1 variant is required"
    }

    // ------------------ Variants validations ------------------
    if (formData.variants && formData.variants.length > 0) {
      const variantsErrors: { [index: number]: VariantFormErrors } = {};

      formData.variants.forEach((variant, index) => {
        const variantErrors: VariantFormErrors = {};

        if (!variant.title?.trim()) variantErrors.title = "Title is required";
        if (!variant.sku?.trim()) variantErrors.sku = "SKU is required";

        // Validate variantType (required field)
        if (!variant.variantType) {
          variantErrors.variantType = "Variant type is required";
        } else if (
          !variantEnumValues.variantType.includes(variant.variantType)
        ) {
          variantErrors.variantType = "Invalid variant type";
        }

        // Price required and non-negative
        if (variant.price == null) variantErrors.price = "Price is required";
        else if (variant.price < 0)
          variantErrors.price = "Price cannot be negative";

        // DiscountPercent required
        // if (variant.discountPercent == null)
        //   variantErrors.discountPercent = "Discount % is required";
        if (variant.discountPercent && (variant.discountPercent < 0 || variant.discountPercent > 100))
          variantErrors.discountPercent =
            "Discount % must be between 0 and 100";

        // Measurement validation
        if (variant.measurement != null && variant.measurement < 0)
          variantErrors.measurement = "Measurement cannot be negative";

        // Stock validation based on inventory type
        if (variant.inventoryType === "LIMITED") {
          if (variant.stock == null)
            variantErrors.stock = "Stock is required for limited inventory";
          else if (!Number.isInteger(variant.stock))
            variantErrors.stock = "Stock must be a whole number";
          else if (variant.stock < 0)
            variantErrors.stock = "Stock cannot be negative";
        } else if (variant.stock != null) {
          if (!Number.isInteger(variant.stock))
            variantErrors.stock = "Stock must be a whole number";
          else if (variant.stock < 0)
            variantErrors.stock = "Stock cannot be negative";
        }

        // Enum checks
        if (
          variant.inventoryType &&
          !variantEnumValues.inventoryType.includes(variant.inventoryType)
        ) {
          variantErrors.inventoryType = "Invalid inventory type";
        }
        if (
          variant.status &&
          !variantEnumValues.status.includes(variant.status)
        ) {
          variantErrors.status = "Invalid variant status";
        }

        if (Object.keys(variantErrors).length > 0) {
          variantsErrors[index] = variantErrors;
        }
      });

      // Only set variants errors if there are any
      if (Object.keys(variantsErrors).length > 0) {
        newErrors.variants = variantsErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(getDefaultCreateForm());
    setErrors({});

    // Revoke all object URLs to free memory
    imageFiles.forEach((img) => URL.revokeObjectURL(img.preview));
    setImageFiles([]);
  };

  return {
    formData,
    errors,
    imageFiles,
    updateField,
    handleChange,
    handleArrayChange,
    validateForm,
    resetForm,

    defaultVariant: getDefaultVariant(),

    // Image file management (preview only)
    handleAddImageFiles,
    handleRemoveImageFile,
    handleSetMainImage,
    getFilesForUpload,
    generateSlug,
    autoGenerateSKU,

    // Validation helpers
    validateFileType,
    validateFileSize,

    parentCategories,
    subCategories,
    selectedParentCategory,
    handleParentCategoryChange,
    handleSubCategoryChange,
  };
}
