import { useState, useEffect, useCallback, useMemo } from "react";
import { CategoryType, TypeOfCategory, UpdateCategoryPayload } from "@/lib/types";
import { useAdminCategory } from "@/hooks";

interface EditCategoryFormErrors {
  name?: string;
  slug?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  type?: string;
  thumbnail?: string;
  parent?: string;
  [key: string]: string | undefined;
}

interface ImageFile {
  file: File;
  preview: string;
}

export function useEditCategoryForm(initialCategory?: CategoryType | null) {
  const [formData, setFormData] = useState<UpdateCategoryPayload>(() => mapCategoryToPayload(initialCategory));
  const [errors, setErrors] = useState<EditCategoryFormErrors>({});
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [bannerFile, setBannerFile] = useState<ImageFile | null>(null);

  const { adminCategories } = useAdminCategory();

  useEffect(() => {
    if (initialCategory) {
      setFormData(mapCategoryToPayload(initialCategory));
      setErrors({});
      setImageFile(null);
      setBannerFile(null);
    }
  }, [initialCategory]);

  const updateField = (field: keyof UpdateCategoryPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === "checkbox") processedValue = (e.target as HTMLInputElement).checked;
    else if (type === "number") processedValue = value === "" ? null : Number(value);

    updateField(name as keyof UpdateCategoryPayload, processedValue);
  };

  const parentOptions = useMemo(() => {
    const allowedParentType = getAllowedParentType(formData.type);

    if (formData.parent) {
      const parent = adminCategories.find((c: any) => c._id === formData.parent);
      if (parent && parent.type !== allowedParentType) {
        updateField("parent", undefined);
      }
    }

    return [
      { value: "", label: "None" },
      ...adminCategories
        .filter((cat:any) => {
          if ((initialCategory && cat._id === initialCategory._id) || !allowedParentType) return false;
          return cat.type === allowedParentType;
        })
        .map((cat: any) => ({ value: cat._id, label: `${cat.name} (${cat.type})` })),
    ];
  }, [formData.type, adminCategories, initialCategory]);

  const validateFileType = (file: File): boolean => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    return allowed.includes(file.type);
  };

  const validateFileSize = (file: File, maxMB = 5): boolean => {
    return file.size <= maxMB * 1024 * 1024;
  };

  const handleAddImageFile = useCallback(
    (file?: File) => {
      if (!file) {
        setErrors((prev) => ({ ...prev, thumbnail: "No file selected" }));
        return;
      }

      if (!validateFileType(file)) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: "Invalid file type. Use JPG, PNG, WEBP, or GIF.",
        }));
        return;
      }

      if (!validateFileSize(file)) {
        setErrors((prev) => ({ ...prev, thumbnail: "File size exceeds 5MB limit" }));
        return;
      }

      const preview = URL.createObjectURL(file);
      setImageFile({ file, preview });

      if (errors.thumbnail) setErrors((prev) => ({ ...prev, thumbnail: undefined }));
    },
    [errors.thumbnail]
  );

  const handleRemoveImageFile = useCallback(() => {
    if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    setImageFile(null);
  }, [imageFile]);

  // ✅ Add banner image file (preview only)
  const handleAddBannerFile = useCallback(
    (file?: File) => {
      if (!file) {
        return;
      }

      if (!validateFileType(file)) {
        setErrors((prev) => ({
          ...prev,
          banner: "Invalid file type. Use JPG, PNG, WEBP, or GIF.",
        }));
        return;
      }

      if (!validateFileSize(file)) {
        setErrors((prev) => ({ ...prev, banner: "File size exceeds 5MB limit" }));
        return;
      }

      const preview = URL.createObjectURL(file);
      setBannerFile({ file, preview });

      if (errors.banner) setErrors((prev) => ({ ...prev, banner: undefined }));
    },
    [errors.banner]
  );

  const handleRemoveBannerFile = useCallback(() => {
    if (bannerFile?.preview) URL.revokeObjectURL(bannerFile.preview);
    setBannerFile(null);
  }, [bannerFile]);

  const getFileForUpload = useCallback((): File | null => {
    return imageFile?.file || null;
  }, [imageFile]);

  const getBannerForUpload = useCallback((): File | null => {
    return bannerFile?.file || null;
  }, [bannerFile]);

  const validateForm = (): boolean => {
    const newErrors: EditCategoryFormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.length > 200) {
      newErrors.name = "Name cannot exceed 200 characters";
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (!formData.type) {
      newErrors.type = "Category type is required";
    }

    if (formData.type) {
      if (formData.type !== TypeOfCategory.MASTER && !formData.parent) {
        newErrors.parent = "Parent category is required for non-MASTER categories";
      }
      if (formData.type === TypeOfCategory.MASTER && formData.parent) {
        newErrors.parent = "MASTER category cannot have a parent";
      }
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = "Meta title should not exceed 60 characters";
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = "Meta description should not exceed 160 characters";
    }

    // 🖼️ Image validation
    if (!imageFile && !formData.thumbnail) {
      newErrors.thumbnail = "Category image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    if (initialCategory) setFormData(mapCategoryToPayload(initialCategory));
    setErrors({});
    if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    if (bannerFile?.preview) URL.revokeObjectURL(bannerFile.preview);
    setImageFile(null);
    setBannerFile(null);
  };

  const getSafeStringValue = (field: keyof UpdateCategoryPayload): string => {
    const val = formData[field];
    return typeof val === "string" ? val : "";
  };

  const getSafeBooleanValue = (field: keyof UpdateCategoryPayload): boolean => {
    const val = formData[field];
    return typeof val === "boolean" ? val : false;
  };

  return {
    formData,
    setFormData,
    errors,
    imageFile,
    bannerFile,
    updateField,
    handleChange,
    handleAddImageFile,
    handleRemoveImageFile,
    getFileForUpload,
    handleAddBannerFile,
    handleRemoveBannerFile,
    getBannerForUpload,
    validateForm,
    resetForm,
    getSafeStringValue,
    getSafeBooleanValue,
    parentOptions,
  };
}

function getAllowedParentType(type?: TypeOfCategory): TypeOfCategory | null {
  switch (type) {
    case TypeOfCategory.SUPER:
      return TypeOfCategory.MASTER;
    case TypeOfCategory.CATEGORY:
      return TypeOfCategory.SUPER;
    case TypeOfCategory.SUBCATEGORY:
      return TypeOfCategory.CATEGORY;
    default:
      return null;
  }
}

const mapCategoryToPayload = (cat?: CategoryType | null): UpdateCategoryPayload => {
  if (!cat) {
    return {
      name: "",
      slug: "",
      type: TypeOfCategory.CATEGORY,
      parent: undefined,
      isActive: true,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      thumbnail: "",
    };
  }

  return {
    name: cat.name ?? "",
    slug: cat.slug ?? "",
    type: cat.type ?? TypeOfCategory.CATEGORY,
    parent: cat.parent?._id ?? undefined,
    isActive: cat.isActive ?? true,
    metaTitle: cat.metaTitle ?? "",
    metaDescription: cat.metaDescription ?? "",
    metaKeywords: cat.metaKeywords ?? "",
    thumbnail: cat.thumbnail ?? "",
    banner: cat.banner ?? "",
  };
};