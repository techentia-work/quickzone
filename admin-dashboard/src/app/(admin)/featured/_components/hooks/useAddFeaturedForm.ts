"use client";

import { useState, useCallback } from "react";
import {
  CreateFeaturedPayload,
  FeaturedFormErrors,
} from "@/lib/types/featured/featured.types";

interface ImageFile {
  file: File;
  preview: string;
}

const defaultFeaturedForm: CreateFeaturedPayload = {
  title: "",
  slug: "",
  description: "",
  imageUrl: "",
  imageUrl1: "", // ✅ ADD
  color: "#ffffff",
  order: undefined,
  position: "TOP",
  masterCategory: null,
  metaTitle: "",
  metaDescription: "",
  isActive: true,
  isMappable: false,
  category: [],
  subcategory: [],
  isClickable: false,
  appLayout: "DEFAULT",
  gridCount: 6,
};

export function useAddFeaturedForm() {
  const [formData, setFormData] =
    useState<CreateFeaturedPayload>(defaultFeaturedForm);

  const [errors, setErrors] = useState<FeaturedFormErrors>({});

  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [imageFile1, setImageFile1] = useState<ImageFile | null>(null); // ✅ ADD

  const updateField = (field: keyof CreateFeaturedPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let processed: any = value;

    if (type === "number")
      processed = value === "" ? undefined : Number(value);
    if (type === "checkbox")
      processed = (e.target as HTMLInputElement).checked;

    if (name === "masterCategory") {
      processed = value ? value : null;
    }

    updateField(name as keyof CreateFeaturedPayload, processed);
  };

  /* ---------------- FILE VALIDATION ---------------- */
  const validateFileType = (file: File): boolean => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    return allowed.includes(file.type);
  };

  const validateFileSize = (file: File, maxMB = 5): boolean =>
    file.size <= maxMB * 1024 * 1024;

  /* ---------------- IMAGE 1 (imageUrl) ---------------- */
  const handleAddImageFile = useCallback((file?: File) => {
    if (!file)
      return setErrors((prev) => ({
        ...prev,
        imageUrl: "No file selected",
      }));

    if (!validateFileType(file))
      return setErrors((prev) => ({
        ...prev,
        imageUrl: "Invalid image type (JPG, PNG, WEBP, GIF only)",
      }));

    if (!validateFileSize(file, 5))
      return setErrors((prev) => ({
        ...prev,
        imageUrl: "Image exceeds 5MB limit",
      }));

    const preview = URL.createObjectURL(file);
    setImageFile({ file, preview });
    setErrors((prev) => ({ ...prev, imageUrl: undefined }));
  }, []);

  const handleRemoveImageFile = useCallback(() => {
    if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    setImageFile(null);
  }, [imageFile]);

  const getFileForUpload = useCallback((): File | null => {
    return imageFile?.file || null;
  }, [imageFile]);

  /* ---------------- IMAGE 2 (imageUrl1 – APP) ---------------- */
  const handleAddImageFile1 = useCallback((file?: File) => {
    if (!file)
      return setErrors((prev) => ({
        ...prev,
        imageUrl1: "No file selected",
      }));

    if (!validateFileType(file))
      return setErrors((prev) => ({
        ...prev,
        imageUrl1: "Invalid image type (JPG, PNG, WEBP, GIF only)",
      }));

    

    const preview = URL.createObjectURL(file);
    setImageFile1({ file, preview });
    setErrors((prev) => ({ ...prev, imageUrl1: undefined }));
  }, []);

  const handleRemoveImageFile1 = useCallback(() => {
    if (imageFile1?.preview) URL.revokeObjectURL(imageFile1.preview);
    setImageFile1(null);
  }, [imageFile1]);

  const getFileForUpload1 = useCallback((): File | null => {
    return imageFile1?.file || null;
  }, [imageFile1]);

  /* ---------------- VALIDATION ---------------- */
  const validateForm = (isSubmitting = false): boolean => {
    const newErrors: FeaturedFormErrors = {};

    if (!formData.title?.trim())
      newErrors.title = "Title is required";

    if (isSubmitting && !imageFile && !formData.imageUrl)
      newErrors.imageUrl = "Featured image is required";

    if (formData.metaTitle && formData.metaTitle.length > 60)
      newErrors.metaTitle = "Meta title should not exceed 60 characters";

    if (
      formData.metaDescription &&
      formData.metaDescription.length > 160
    )
      newErrors.metaDescription =
        "Meta description should not exceed 160 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(defaultFeaturedForm);
    setErrors({});
    if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    if (imageFile1?.preview) URL.revokeObjectURL(imageFile1.preview);
    setImageFile(null);
    setImageFile1(null);
  };

  return {
    formData,
    errors,

    imageFile,
    imageFile1, // ✅ EXPORT

    updateField,
    handleChange,
    validateForm,
    resetForm,
    setFormData,

    handleAddImageFile,
    handleRemoveImageFile,
    getFileForUpload,

    handleAddImageFile1, // ✅ EXPORT
    handleRemoveImageFile1,
    getFileForUpload1,
  };
}
