"use client";

import { useState } from "react";
import { CreateFeaturedWeekBrandPayload, FeaturedWeekBrandFormErrors } from "@/lib/types/featuredWeekBrand/featuredWeekBrand.types";

export function useBrandForm(defaultData?: Partial<CreateFeaturedWeekBrandPayload>) {
  const [formData, setFormData] = useState<CreateFeaturedWeekBrandPayload>({
    name: defaultData?.name ?? "",
    slug: defaultData?.slug ?? "",
    banner: defaultData?.banner ?? "",
    thumbnail: defaultData?.thumbnail ?? "",
    isActive: defaultData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<FeaturedWeekBrandFormErrors>({});

  const [bannerFile, setBannerFile] = useState<{
    file: File;
    preview: string;
  } | null>(null);

  const [thumbnailFile, setThumbnailFile] = useState<{
    file: File;
    preview: string;
  } | null>(null);

  // 🔹 Slug generator
  const generateSlug = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // 🔹 Update single field
  const updateField = (key: keyof CreateFeaturedWeekBrandPayload, value: any) => {
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
      name as keyof CreateFeaturedWeekBrandPayload,
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
    const e: FeaturedWeekBrandFormErrors = {};

    if (!formData.name.trim()) e.name = "Brand name is required";
    if (!formData.slug?.trim()) e.slug = "Slug is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 🔹 Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      banner: "",
      thumbnail: "",
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
    generateSlug,
    setFormData,
  };
}
