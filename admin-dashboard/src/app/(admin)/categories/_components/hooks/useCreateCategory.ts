import { CreateCategoryPayload, TypeOfCategory } from "@/lib/types";
import { useState, useCallback } from "react";
import { slugify } from "@/lib/utils/helper.client.utils";

interface CategoryFormErrors {
  name?: string;
  slug?: string;
  type?: string;
  parent?: string;
  order?: string;
  metaTitle?: string;
  metaDescription?: string;
  thumbnail?: string;
  [key: string]: string | undefined;
}

interface ImageFile {
  file: File;
  preview: string;
}

const defaultCreateForm: CreateCategoryPayload = {
  name: "",
  slug: "",
  subtitle: "",
  thumbnail: "",
  banner: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  markup: "",
  type: TypeOfCategory.CATEGORY,
  parent: null,
  isActive: true,
};

export function useCreateCategoryForm() {
  const [formData, setFormData] =
    useState<CreateCategoryPayload>(defaultCreateForm);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [bannerFile, setBannerFile] = useState<ImageFile | null>(null);

  // ✅ Generic field updater
  const updateField = (field: keyof CreateCategoryPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ✅ Handles standard inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === "number") processedValue = value === "" ? null : Number(value);
    if (type === "checkbox")
      processedValue = (e.target as HTMLInputElement).checked;

    updateField(name as keyof CreateCategoryPayload, processedValue);
  };

  // ✅ File validations
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

  const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
    const maxSize = maxSizeMB * 1024 * 1024;
    return file.size <= maxSize;
  };

  // ✅ Add single image file (preview only)
  const handleAddImageFile = useCallback(
    (file?: File) => {
      if (!file) {
        setErrors((prev) => ({ ...prev, thumbnail: "No file selected", }));
        return;
      }

      if (!validateFileType(file)) {
        setErrors((prev) => ({
          ...prev, thumbnail: "Invalid file type. Allowed: JPG, PNG, WEBP, GIF",
        }));
        return;
      }

      if (!validateFileSize(file, 5)) {
        setErrors((prev) => ({ ...prev, thumbnail: "File size exceeds 5MB limit", }));
        return;
      }

      const preview = URL.createObjectURL(file);
      setImageFile({ file, preview });

      if (errors.thumbnail) {
        setErrors((prev) => ({ ...prev, thumbnail: undefined }));
      }
    },
    [errors.thumbnail]
  );

  const handleRemoveImageFile = useCallback(() => {
    if (imageFile?.preview)
      URL.revokeObjectURL(imageFile.preview);
    setImageFile(null);
  }, [imageFile]);

  // ✅ Add banner image file (preview only)
  const handleAddBannerFile = useCallback(
    (file?: File) => {
      if (!file) return;

      if (!validateFileType(file)) {
        setErrors((prev) => ({
          ...prev, banner: "Invalid file type. Allowed: JPG, PNG, WEBP, GIF",
        }));
        return;
      }

      if (!validateFileSize(file, 5)) {
        setErrors((prev) => ({ ...prev, banner: "File size exceeds 5MB limit", }));
        return;
      }

      const preview = URL.createObjectURL(file);
      setBannerFile({ file, preview });

      if (errors.banner) {
        setErrors((prev) => ({ ...prev, banner: undefined }));
      }
    },
    [errors.banner]
  );

  const handleRemoveBannerFile = useCallback(() => {
    if (bannerFile?.preview)
      URL.revokeObjectURL(bannerFile.preview);
    setBannerFile(null);
  }, [bannerFile]);

  const getFileForUpload = useCallback((): File | null => {
    return imageFile?.file || null;
  }, [imageFile]);

  const getBannerForUpload = useCallback((): File | null => {
    return bannerFile?.file || null;
  }, [bannerFile]);

  const validateForm = (): boolean => {
    const newErrors: CategoryFormErrors = {};

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
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    } else if (formData.slug.length < 2) {
      newErrors.slug = "Slug must be at least 2 characters";
    } else if (formData.slug.length > 200) {
      newErrors.slug = "Slug cannot exceed 200 characters";
    }

    if (!formData.type) {
      newErrors.type = "Category type is required";
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = "Meta title should not exceed 60 characters";
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription =
        "Meta description should not exceed 160 characters";
    }

    if (!imageFile && !formData.thumbnail) {
      newErrors.thumbnail = "Category image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(defaultCreateForm);
    setErrors({});
    if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    if (bannerFile?.preview) URL.revokeObjectURL(bannerFile.preview);
    setImageFile(null);
    setBannerFile(null);
  };

  const generateSlug = useCallback((name: string) => slugify(name), []);

  return {
    formData,
    errors,
    imageFile,
    bannerFile,
    updateField,
    handleChange,
    validateForm,
    resetForm,
    setFormData,
    generateSlug,

    // 🖼️ Image controls
    handleAddImageFile,
    handleRemoveImageFile,
    getFileForUpload,
    handleAddBannerFile,
    handleRemoveBannerFile,
    getBannerForUpload,
    validateFileType,
    validateFileSize,
  };
}
