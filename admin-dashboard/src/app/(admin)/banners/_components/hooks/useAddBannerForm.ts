"use client";

import { useState, useCallback } from "react";
import {
  CreateBannerPayload,
  BannerFormErrors,
} from "@/lib/types/banner/banner.types";

interface ImageFile {
  file: File;
  preview: string;
}

const defaultBannerForm: CreateBannerPayload = {
  title: "",
  description: "",
  slug: "",
  imageUrl: "",
  order: undefined,
  position: "TOP",
  isActive: true,
  masterCategory: null, // ✅ Changed from undefined to null
};

export function useAddBannerForm() {
  const [formData, setFormData] =
    useState<CreateBannerPayload>(defaultBannerForm);
  const [errors, setErrors] = useState<BannerFormErrors>({});
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);

  const updateField = (field: keyof CreateBannerPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    let processed: any = value;

    if (type === "checkbox") processed = (e.target as HTMLInputElement).checked;
    if (type === "number") processed = Number(value);

    // ✅ Convert empty strings to null for category fields
    if (
      (name === "masterCategory" || 
       name === "category" || 
       name === "subcategory") && 
      (!value || value === "default" || value === "")
    ) {
      processed = null;
    }

    updateField(name as keyof CreateBannerPayload, processed);
  };

  const validateFileType = (file: File) =>
    ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  const validateFileSize = (file: File, maxMB = 5) =>
    file.size <= maxMB * 1024 * 1024;

  const handleAddImageFile = useCallback((file?: File) => {
    if (!file)
      return setErrors((p) => ({ ...p, imageUrl: "No file selected" }));
    if (!validateFileType(file))
      return setErrors((p) => ({ ...p, imageUrl: "Invalid image type" }));
    if (!validateFileSize(file))
      return setErrors((p) => ({ ...p, imageUrl: "File too large (max 5MB)" }));

    const preview = URL.createObjectURL(file);
    setImageFile({ file, preview });
    setErrors((p) => ({ ...p, imageUrl: undefined }));
  }, []);

  const handleRemoveImageFile = useCallback(() => {
    if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    setImageFile(null);
  }, [imageFile]);

  const validateForm = (isSubmitting = false) => {
    const newErrors: BannerFormErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (isSubmitting && !formData.imageUrl && !imageFile)
      newErrors.imageUrl = "Banner image required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(defaultBannerForm);
    setErrors({});
    if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    setImageFile(null);
  };

  return {
    formData,
    setFormData,
    errors,
    imageFile,
    updateField,
    handleChange,
    validateForm,
    handleAddImageFile,
    handleRemoveImageFile,
    resetForm,
  };
}