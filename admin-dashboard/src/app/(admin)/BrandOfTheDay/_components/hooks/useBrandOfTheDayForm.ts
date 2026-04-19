"use client";

import { useState } from "react";
import {
  CreateBrandOfTheDayPayload,
  BrandOfTheDayFormErrors,
} from "@/lib/types/brandOfTheDay/brandOfTheDay.types";

export function useBrandOfTheDayForm(
  defaultData?: Partial<CreateBrandOfTheDayPayload>
) {
  const [formData, setFormData] =
    useState<CreateBrandOfTheDayPayload>({
      name: defaultData?.name ?? "",               // ✅ ADDED
      title: defaultData?.title ?? "",
      websiteUrl: defaultData?.websiteUrl ?? "",
      banner: defaultData?.banner ?? "",
      thumbnail: defaultData?.thumbnail ?? "",
      masterCategory: defaultData?.masterCategory ?? null,
      isActive: defaultData?.isActive ?? true,
    });

  const [errors, setErrors] =
    useState<BrandOfTheDayFormErrors>({});

  const [bannerFile, setBannerFile] = useState<{
    file: File;
    preview: string;
  } | null>(null);

  const [thumbnailFile, setThumbnailFile] = useState<{
    file: File;
    preview: string;
  } | null>(null);

  // 🔹 Update single field
  const updateField = (
    key: keyof CreateBrandOfTheDayPayload,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  // 🔹 Input / Checkbox change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    updateField(
      name as keyof CreateBrandOfTheDayPayload,
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value
    );
  };

  // 🔹 Banner upload
  const handleBannerUpload = (file: File) => {
    setBannerFile({
      file,
      preview: URL.createObjectURL(file),
    });
  };

  // 🔹 Thumbnail upload
  const handleThumbnailUpload = (file: File) => {
    setThumbnailFile({
      file,
      preview: URL.createObjectURL(file),
    });
  };

  // 🔹 Validation
  const validateForm = () => {
    const e: BrandOfTheDayFormErrors = {};

    if (!formData.name.trim())
      e.name = "Brand name is required";

    if (!formData.title.trim())
      e.title = "Title is required";

    if (!formData.websiteUrl.trim())
      e.websiteUrl = "Website URL is required";

    try {
      new URL(formData.websiteUrl);
    } catch {
      e.websiteUrl = "Invalid website URL";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 🔹 Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      websiteUrl: "",
      banner: "",
      thumbnail: "",
      masterCategory: null,
      isActive: true,
    });
    setErrors({});
    setBannerFile(null);
    setThumbnailFile(null);
  };

  return {
    formData,
    errors,

    bannerFile,
    thumbnailFile,

    handleChange,
    updateField,

    handleBannerUpload,
    handleThumbnailUpload,

    validateForm,
    resetForm,
    setFormData,
  };
}
