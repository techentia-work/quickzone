"use client";

import { useState, useCallback } from "react";
import { CreateBrandPayload, BrandFormErrors } from "@/lib/types";
import { slugify } from "@/lib/utils/helper.client.utils";

export function useBrandForm(defaultData?: Partial<CreateBrandPayload>) {
  const [formData, setFormData] = useState<CreateBrandPayload>({
    name: defaultData?.name ?? "",
    slug: defaultData?.slug ?? "",
    banner: defaultData?.banner ?? "",
    thumbnail: defaultData?.thumbnail ?? "",
    isActive: defaultData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<BrandFormErrors>({});
  const [bannerFile, setBannerFile] = useState<any>(null);
  const [thumbnailFile, setThumbnailFile] = useState<any>(null);

  const generateSlug = useCallback((str: string) => slugify(str), []);

  const updateField = (key: keyof CreateBrandPayload, value: any) => {
    setFormData((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    updateField(name as keyof CreateBrandPayload, type === "checkbox" ? (e.target as any).checked : value);
  };

  const handleBannerUpload = (file: File) => {
    const preview = URL.createObjectURL(file);
    setBannerFile({ file, preview });
  };

  const handleThumbnailUpload = (file: File) => {
    const preview = URL.createObjectURL(file);
    setThumbnailFile({ file, preview });
  };

  const validateForm = () => {
    const e: BrandFormErrors = {};
    if (!formData.name.trim()) e.name = "Brand name is required";
    if (!formData.slug?.trim()) e.slug = "Slug is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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
    resetForm,
    validateForm,
    generateSlug,
    setFormData,
  };
}
