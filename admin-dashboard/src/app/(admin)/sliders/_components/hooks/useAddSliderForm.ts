"use client";

import { useState, useCallback } from "react";
import {
  CreateSliderPayload,
  SliderFormErrors,
} from "@/lib/types/slider/slider.types";

interface ImageFile {
  file: File;
  preview: string;
}

const defaultSliderForm: CreateSliderPayload = {
  title: "",
  imageUrl: "",
  order: undefined,
  position: "TOP",
  isActive: true,
  slug: "",
};

export function useAddSliderForm() {
  const [formData, setFormData] =
    useState<CreateSliderPayload>(defaultSliderForm);
  const [errors, setErrors] = useState<SliderFormErrors>({});
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);

  const updateField = (field: keyof CreateSliderPayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let processed: any = value;
    if (type === "checkbox") processed = (e.target as HTMLInputElement).checked;
    if (type === "number") processed = Number(value);
    updateField(name as keyof CreateSliderPayload, processed);
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
    const newErrors: SliderFormErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (isSubmitting && !formData.imageUrl && !imageFile)
      newErrors.imageUrl = "Slider image required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(defaultSliderForm);
    setErrors({});
    if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview);
    setImageFile(null);
  };

  return {
    formData,
    setFormData, // ✅ added here
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
